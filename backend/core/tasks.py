import json
import logging
import os
import pathlib
import shutil
import subprocess
import sys
import tarfile
import time
from contextlib import contextmanager

from celery import shared_task
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone

from core.models import AOI, FeedbackAOI, FeedbackLabel, Label, Model, Training
from core.serializers import (
    AOISerializer,
    FeedbackAOISerializer,
    FeedbackLabelFileSerializer,
    LabelFileSerializer,
)
from core.utils import bbox, is_dir_empty

from .utils import S3Uploader, send_notification, shift_labels_by_offset

DEFAULT_TILE_SIZE = 256


@contextmanager
def capture_output_to_file(log_path):
    original_stdout, original_stderr = sys.stdout, sys.stderr
    with open(log_path, "a", encoding="utf-8") as f:
        sys.stdout = sys.stderr = f
        try:
            yield
        finally:
            sys.stdout, sys.stderr = original_stdout, original_stderr


# Utility helpers
def safe_rmtree(path):
    try:
        if os.path.exists(path):
            shutil.rmtree(path)
            print(f"Successfully deleted {path} with shutil.rmtree")
    except Exception as e:
        print(f"shutil.rmtree failed: {e}")
        try:
            subprocess.check_call(["rm", "-rf", path])
            print(f"Fallback deletion succeeded for {path}")
        except Exception as fallback_error:
            print(f"Fallback deletion also failed: {fallback_error}")
            raise


def safe_copytree(src, dst):
    safe_rmtree(dst)
    shutil.copytree(src, dst)


def copyfile(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)


def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f)


def get_file_count(path):
    try:
        return len(
            [f for f in os.listdir(path) if os.path.isfile(os.path.join(path, f))]
        )
    except Exception as e:
        logging.getLogger(__name__).error(f"Error counting files: {e}")
        return 0


class print_time:
    def __init__(self, name):
        self.name = name
        self.logger = logging.getLogger(__name__)

    def __enter__(self):
        self.start = time.perf_counter()
        return self

    def __exit__(self, *args):
        self.logger.info(
            f"{self.name} took {round(time.perf_counter() - self.start, 2)}s"
        )


class Trainer:
    def __init__(self, model_type, *args):
        self.model_type = model_type
        self.args = args

    def run(self):
        return (
            self._train_yolo()
            if self.model_type.startswith("YOLO")
            else self._train_ramp()
        )

    def _train_yolo(self):
        from hot_fair_utilities import preprocess
        from hot_fair_utilities.preprocessing.yolo_v8_v1.yolo_format import (
            yolo_format as v1,
        )
        from hot_fair_utilities.preprocessing.yolo_v8_v2.yolo_format import (
            yolo_format as v2,
        )
        from hot_fair_utilities.training.yolo_v8_v1.train import train as train_v1
        from hot_fair_utilities.training.yolo_v8_v2.train import train as train_v2

        (
            inst,
            dataset_id,
            input_path,
            labels,
            aois,
            epochs,
            batch_size,
            freeze_layers,
            multimasks,
            *_,
        ) = self.args
        base = os.path.join(settings.YOLO_HOME, "yolo-data", str(dataset_id))
        safe_rmtree(base)
        prep = f"/{base}/preprocessed"
        model_dir = os.path.join(base, self.model_type)
        yaml = os.path.join(model_dir, "yolo_dataset.yaml")
        out = os.path.join(
            pathlib.Path(input_path).parent, "output", f"training_{inst.id}"
        )

        safe_copytree(input_path, os.path.join(base, "input"))
        preprocess(
            input_path=os.path.join(base, "input"),
            output_path=prep,
            rasterize=True,
            rasterize_options=["binary"],
            georeference_images=True,
            multimasks=(multimasks or self.model_type == "YOLO_V8_V1"),
            epsg=4326 if self.model_type == "YOLO_V8_V2" else 3857,
        )

        inst.chips_length = get_file_count(os.path.join(prep, "chips"))
        inst.save()

        with print_time("YOLO format"):
            if self.model_type == "YOLO_V8_V1":
                v1(
                    preprocessed_dirs=prep,
                    yolo_dir=model_dir,
                    multimask=True,
                    p_val=0.05,
                )
            else:
                v2(input_path=prep, output_path=model_dir)

        train_fn = train_v1 if self.model_type == "YOLO_V8_V1" else train_v2
        weights = (
            "yolov8s_v1-seg-best.pt"
            if self.model_type == "YOLO_V8_V1"
            else "yolov8s_v2-seg.pt"
        )

        model_path, acc = train_fn(
            data=base,
            weights=os.path.join(settings.YOLO_HOME, weights),
            epochs=epochs,
            batch_size=batch_size,
            pc=2.0,
            output_path=model_dir,
            dataset_yaml_path=yaml,
        )

        safe_rmtree(out)
        os.makedirs(out)
        copyfile(model_path, os.path.join(out, "checkpoint.pt"))
        copyfile(
            os.path.join(os.path.dirname(model_path), "best.onnx"),
            os.path.join(out, "checkpoint.onnx"),
        )
        safe_copytree(prep, os.path.join(out, "preprocessed"))
        safe_copytree(input_path, os.path.join(out, "preprocessed", "input"))

        for k in ["images", "labels"]:
            safe_copytree(
                os.path.join(model_dir, k), os.path.join(out, self.model_type, k)
            )

        copyfile(yaml, os.path.join(out, self.model_type, "yolo_dataset.yaml"))
        copyfile(
            os.path.join(pathlib.Path(model_path).parent.parent, "iou_chart.png"),
            os.path.join(out, "graphs", "training_accuracy.png"),
        )

        write_json(os.path.join(out, "labels.geojson"), labels)
        write_json(os.path.join(out, "aois.geojson"), aois.data)

        return {"accuracy": acc, "output_path": out, "preprocess_output": prep}

    def _train_ramp(self):
        import tensorflow as tf
        from hot_fair_utilities import preprocess
        from hot_fair_utilities.training.ramp import train

        (
            inst,
            dataset_id,
            input_path,
            labels,
            aois,
            epochs,
            batch_size,
            freeze_layers,
            multimasks,
            spacing,
            width,
        ) = self.args
        base = os.path.join(settings.RAMP_HOME, "ramp-data", str(dataset_id))
        safe_rmtree(base)
        prep = f"/{base}/preprocessed"
        out = os.path.join(
            pathlib.Path(input_path).parent, "output", f"training_{inst.id}"
        )

        safe_copytree(input_path, os.path.join(base, "input"))
        preprocess(
            input_path=os.path.join(base, "input"),
            output_path=prep,
            rasterize=True,
            rasterize_options=["binary"],
            georeference_images=True,
            multimasks=multimasks,
            input_contact_spacing=spacing,
            input_boundary_width=width,
        )

        inst.chips_length = get_file_count(os.path.join(prep, "chips"))
        inst.save()

        acc, model_path = train(
            input_path=prep,
            output_path=os.path.join(base, "train"),
            epoch_size=epochs,
            batch_size=batch_size,
            model="ramp",
            model_home=os.environ["RAMP_HOME"],
            freeze_layers=freeze_layers,
            multimasks=multimasks,
        )

        safe_rmtree(out)
        os.makedirs(out)
        safe_copytree(model_path, os.path.join(out, "checkpoint.tf"))
        safe_copytree(prep, os.path.join(out, "preprocessed"))
        safe_copytree(input_path, os.path.join(out, "preprocessed", "input"))
        copyfile(
            os.path.join(base, "train", "graphs", "training_accuracy.png"),
            os.path.join(out, "graphs", "training_accuracy.png"),
        )

        model = tf.keras.models.load_model(os.path.join(out, "checkpoint.tf"))
        model.save(os.path.join(out, "checkpoint.h5"))

        tflite_model = tf.lite.TFLiteConverter.from_keras_model(model).convert()
        with open(os.path.join(out, "checkpoint.tflite"), "wb") as f:
            f.write(tflite_model)

        write_json(os.path.join(out, "labels.geojson"), labels)
        write_json(os.path.join(out, "aois.geojson"), aois.data)

        return {"accuracy": acc, "output_path": out, "preprocess_output": prep}


def upload_to_s3(path, parent=None):
    return S3Uploader(
        bucket_name=settings.BUCKET_NAME,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        parent=parent or settings.PARENT_BUCKET_FOLDER,
    ).upload(path)


def xz_folder(folder_path, output_filename, remove_original=False):
    if not output_filename.endswith(".tar.xz"):
        output_filename += ".tar.xz"
    with tarfile.open(output_filename, "w:xz") as tar:
        tar.add(folder_path, arcname=os.path.basename(folder_path))
    if remove_original:
        shutil.rmtree(folder_path)


def prepare_data(inst, dataset_id, feedback, zoom_level, imagery):
    from predictor import download_imagery, get_start_end_download_coords

    base = os.path.join(settings.TRAINING_WORKSPACE, f"dataset_{dataset_id}")
    input_path = os.path.join(base, "input")
    safe_rmtree(input_path)
    os.makedirs(input_path)

    aois = (
        FeedbackAOI.objects.filter(training=feedback)
        if feedback
        else AOI.objects.filter(dataset=dataset_id)
    )
    serializer = FeedbackAOISerializer if feedback else AOISerializer
    label_qs = (
        FeedbackLabel.objects.filter(feedback_aoi__in=aois)
        if feedback
        else Label.objects.filter(aoi__in=aois)
    )
    label_serializer = FeedbackLabelFileSerializer if feedback else LabelFileSerializer

    inst.centroid = aois[0].geom.centroid
    inst.save()

    for obj in aois:
        for z in zoom_level:
            start, end = get_start_end_download_coords(
                bbox(obj.geom.coords[0]), z, DEFAULT_TILE_SIZE
            )
            download_imagery(start, end, z, base_path=input_path, source=imagery)

    if is_dir_empty(input_path):
        raise ValueError("No images found in the area")

    serialized = label_serializer(label_qs, many=True).data
    label_path = os.path.join(input_path, "labels.geojson")
    offset = inst.model.dataset.offset

    if (
        isinstance(offset, list)
        and len(offset) == 2
        and any(float(o) != 0 for o in offset)
    ):
        shift_labels_by_offset(serialized, offset).to_file(
            label_path, driver="GeoJSON", encoding="utf-8"
        )
    else:
        write_json(label_path, serialized)

    with open(label_path) as f:
        return input_path, serializer(aois, many=True), json.load(f)


def run_tippecanoe(out):
    logger = logging.getLogger(__name__)
    try:
        subprocess.run(
            f"tippecanoe -o {out}/meta.pmtiles -Z7 -z18 "
            f"-L aois:{out}/aois.geojson -L labels:{out}/labels.geojson "
            "--force --read-parallel -rg --drop-densest-as-needed",
            shell=True,
            check=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        logger.error("Tippecanoe failed: %s", e.stderr.decode())
        raise


def finalize(inst, out, prep, acc):
    for f in ["aois.geojson", "labels.geojson"]:
        copyfile(os.path.join(out, f), os.path.join(prep, f))
    xz_folder(prep, os.path.join(out, "preprocessed.tar.xz"), remove_original=True)
    upload_to_s3(out, parent=f"{settings.PARENT_BUCKET_FOLDER}/training_{inst.id}")
    inst.accuracy = float(acc)
    inst.finished_at = timezone.now()
    inst.status = "FINISHED"
    inst.save()


@shared_task
def train_model(
    dataset_id,
    training_id,
    epochs,
    batch_size,
    zoom_level,
    source_imagery,
    feedback=None,
    freeze_layers=False,
    multimasks=False,
    input_contact_spacing=8,
    input_boundary_width=3,
):
    inst = get_object_or_404(Training, id=training_id)
    model = get_object_or_404(Model, id=inst.model.id)
    inst.status, inst.started_at, inst.task_id = (
        "RUNNING",
        timezone.now(),
        train_model.request.id,
    )
    inst.save()
    send_notification(inst, "Started")

    log_file = os.path.join(settings.LOG_PATH, f"run_{inst.task_id}.log")
    os.makedirs(settings.LOG_PATH, exist_ok=True)
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(
        logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    )
    logger.addHandler(file_handler)

    try:
        logger.info("Starting model training task")
        with capture_output_to_file(log_file):
            input_path, aoi_ser, labels = prepare_data(
                inst, dataset_id, feedback, zoom_level, source_imagery
            )
            args = (
                inst,
                dataset_id,
                input_path,
                labels,
                aoi_ser,
                epochs,
                batch_size,
                freeze_layers,
                multimasks,
                input_contact_spacing,
                input_boundary_width,
            )
            result = Trainer(model.base_model, *args).run()
            run_tippecanoe(result["output_path"])
            finalize(
                inst,
                result["output_path"],
                result["preprocess_output"],
                result["accuracy"],
            )
        logger.info("Training completed successfully")
        send_notification(inst, "Completed")
        return result
    except Exception as ex:
        logger.exception("Training failed")
        inst.status, inst.finished_at = "FAILED", timezone.now()
        inst.save()
        send_notification(inst, "Failed")
        raise ex
    finally:
        logger.removeHandler(file_handler)
        file_handler.close()
