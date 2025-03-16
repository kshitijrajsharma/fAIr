from django.contrib.gis.db import models as geomodels
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from login.models import OsmUser

# Create your models here.


class Dataset(models.Model):
    """
    Represents a dataset in the system.

    Attributes:
        name (str): The name of the dataset.
        user (OsmUser): The user who created the dataset.
        last_modified (datetime): The last time the dataset was modified.
        created_at (datetime): The time the dataset was created.
        source_imagery (str): The URL of the source imagery for the dataset.
        status (int): The status of the dataset (e.g., active, archived, draft).
    """

    class DatasetStatus(models.IntegerChoices):
        ARCHIVED = 1
        ACTIVE = 0
        DRAFT = -1

    name = models.CharField(max_length=50)
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)
    last_modified = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    source_imagery = models.URLField(blank=True, null=True)
    status = models.IntegerField(
        default=-1, choices=DatasetStatus.choices
    )  # 0 for active , 1 for archieved


class AOI(models.Model):
    """
    Represents an Area of Interest (AOI) within a dataset.

    Attributes:
        dataset (Dataset): The dataset to which the AOI belongs.
        geom (Polygon): The geometry of the AOI.
        label_status (int): The status of label download for the AOI.
        label_fetched (datetime): The time when labels were last fetched.
        created_at (datetime): The time the AOI was created.
        last_modified (datetime): The last time the AOI was modified.
        user (OsmUser): The user who created the AOI.
    """

    class DownloadStatus(models.IntegerChoices):
        DOWNLOADED = 1
        NOT_DOWNLOADED = -1
        RUNNING = 0

    dataset = models.ForeignKey(Dataset, to_field="id", on_delete=models.CASCADE)
    geom = geomodels.PolygonField(srid=4326)
    label_status = models.IntegerField(default=-1, choices=DownloadStatus.choices)
    label_fetched = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)


class Label(models.Model):
    """
    Represents a label within an AOI.

    Attributes:
        aoi (AOI): The AOI to which the label belongs.
        geom (Geometry): The geometry of the label.
        osm_id (int): The OSM ID of the label.
        tags (dict): The tags associated with the label.
        created_at (datetime): The time the label was created.
    """

    aoi = models.ForeignKey(AOI, to_field="id", on_delete=models.CASCADE)
    geom = geomodels.GeometryField(srid=4326)
    osm_id = models.BigIntegerField(null=True, blank=True)
    tags = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Model(models.Model):
    """
    Represents a model in the system.

    Attributes:
        dataset (Dataset): The dataset to which the model belongs.
        name (str): The name of the model.
        created_at (datetime): The time the model was created.
        last_modified (datetime): The last time the model was modified.
        description (str): The description of the model.
        user (OsmUser): The user who created the model.
        published_training (int): The ID of the published training for the model.
        status (int): The status of the model (e.g., active, archived, draft).
        base_model (str): The base model used for training.
    """

    BASE_MODEL_CHOICES = (
        ("RAMP", "RAMP"),
        ("YOLO_V8_V1", "YOLO_V8_V1"),
        ("YOLO_V8_V2", "YOLO_V8_V2"),
    )

    class ModelStatus(models.IntegerChoices):
        ARCHIVED = 1
        PUBLISHED = 0
        DRAFT = -1

    dataset = models.ForeignKey(Dataset, to_field="id", on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    description = models.TextField(max_length=4000, null=True, blank=True)
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)
    published_training = models.PositiveIntegerField(null=True, blank=True)
    status = models.IntegerField(default=-1, choices=ModelStatus.choices)
    base_model = models.CharField(
        choices=BASE_MODEL_CHOICES, default="RAMP", max_length=50
    )


class Training(models.Model):
    """
    Represents a training instance for a model.

    Attributes:
        model (Model): The model being trained.
        source_imagery (str): The URL of the source imagery for training.
        description (str): The description of the training.
        created_at (datetime): The time the training was created.
        status (str): The status of the training (e.g., submitted, running, finished, failed).
        task_id (str): The ID of the task associated with the training.
        zoom_level (list): The zoom levels used for training.
        user (OsmUser): The user who created the training.
        started_at (datetime): The time the training started.
        finished_at (datetime): The time the training finished.
        accuracy (float): The accuracy of the training.
        epochs (int): The number of epochs for training.
        chips_length (int): The length of the training chips.
        batch_size (int): The batch size for training.
        freeze_layers (bool): Whether to freeze layers during training.
        centroid (Point): The centroid of the training area.
    """

    STATUS_CHOICES = (
        ("SUBMITTED", "SUBMITTED"),
        ("RUNNING", "RUNNING"),
        ("FINISHED", "FINISHED"),
        ("FAILED", "FAILED"),
    )
    model = models.ForeignKey(Model, to_field="id", on_delete=models.CASCADE)
    source_imagery = models.URLField(blank=True, null=True)
    description = models.TextField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        choices=STATUS_CHOICES, default="SUBMITTED", max_length=10
    )
    task_id = models.CharField(null=True, blank=True, max_length=100)
    zoom_level = ArrayField(
        models.PositiveIntegerField(),
        size=4,
    )
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    accuracy = models.FloatField(null=True, blank=True)
    epochs = models.PositiveIntegerField()
    chips_length = models.PositiveIntegerField(default=0)
    batch_size = models.PositiveIntegerField()
    freeze_layers = models.BooleanField(default=False)
    centroid = geomodels.PointField(srid=4326, null=True, blank=True)


class Feedback(models.Model):
    """
    Represents feedback for a training instance.

    Attributes:
        geom (Geometry): The geometry of the feedback.
        training (Training): The training instance to which the feedback belongs.
        created_at (datetime): The time the feedback was created.
        zoom_level (int): The zoom level of the feedback.
        feedback_type (str): The type of feedback (e.g., true positive, true negative, false positive, false negative).
        comments (str): Additional comments for the feedback.
        user (OsmUser): The user who created the feedback.
        source_imagery (str): The URL of the source imagery for the feedback.
    """

    FEEDBACK_TYPE = (
        ("TP", "True Positive"),
        ("TN", "True Negative"),
        ("FP", "False Positive"),
        ("FN", "False Negative"),
    )
    geom = geomodels.GeometryField(srid=4326)
    training = models.ForeignKey(Training, to_field="id", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    zoom_level = models.PositiveIntegerField(
        validators=[MinValueValidator(18), MaxValueValidator(23)]
    )
    feedback_type = models.CharField(choices=FEEDBACK_TYPE, max_length=10)
    comments = models.TextField(max_length=100, null=True, blank=True)
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)
    source_imagery = models.URLField()


class FeedbackAOI(models.Model):
    """
    Represents an Area of Interest (AOI) for feedback within a training instance.

    Attributes:
        training (Training): The training instance to which the feedback AOI belongs.
        geom (Polygon): The geometry of the feedback AOI.
        label_status (int): The status of label download for the feedback AOI.
        label_fetched (datetime): The time when labels were last fetched.
        created_at (datetime): The time the feedback AOI was created.
        last_modified (datetime): The last time the feedback AOI was modified.
        source_imagery (str): The URL of the source imagery for the feedback AOI.
        user (OsmUser): The user who created the feedback AOI.
    """

    class DownloadStatus(models.IntegerChoices):
        DOWNLOADED = 1
        NOT_DOWNLOADED = -1
        RUNNING = 0

    training = models.ForeignKey(Training, to_field="id", on_delete=models.CASCADE)
    geom = geomodels.PolygonField(srid=4326)
    label_status = models.IntegerField(default=-1, choices=DownloadStatus.choices)
    label_fetched = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)
    source_imagery = models.URLField()
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)


class FeedbackLabel(models.Model):
    """
    Represents a label within a feedback AOI.

    Attributes:
        osm_id (int): The OSM ID of the label.
        feedback_aoi (FeedbackAOI): The feedback AOI to which the label belongs.
        tags (dict): The tags associated with the label.
        geom (Polygon): The geometry of the label.
        created_at (datetime): The time the label was created.
    """

    osm_id = models.BigIntegerField(null=True, blank=True)
    feedback_aoi = models.ForeignKey(
        FeedbackAOI, to_field="id", on_delete=models.CASCADE
    )
    tags = models.JSONField(null=True, blank=True)

    geom = geomodels.PolygonField(srid=4326)
    created_at = models.DateTimeField(auto_now_add=True)


class ApprovedPredictions(models.Model):
    """
    Represents approved predictions for a training instance.

    Attributes:
        training (Training): The training instance to which the approved predictions belong.
        config (dict): The configuration used for the predictions.
        geom (Geometry): The geometry of the approved predictions.
        approved_at (datetime): The time the predictions were approved.
        user (OsmUser): The user who approved the predictions.
    """

    training = models.ForeignKey(Training, to_field="id", on_delete=models.DO_NOTHING)
    config = models.JSONField(
        null=True, blank=True
    )  ### Config meant to be kept for vectorization config / zoom config , to know what user is using for the most of the time
    geom = geomodels.GeometryField(
        srid=4326
    )  ## Making this geometry field to support point/line prediction later on
    approved_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(OsmUser, to_field="osm_id", on_delete=models.CASCADE)


class Banner(models.Model):
    """
    Represents a banner message to be displayed in the system.

    Attributes:
        message (str): The banner message.
        start_date (datetime): The start date for displaying the banner.
        end_date (datetime): The end date for displaying the banner.
    """

    message = models.TextField(max_length=500)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)

    def is_displayable(self):
        """
        Check if the banner is currently displayable.

        Returns:
            bool: True if the banner is displayable, False otherwise.
        """
        now = timezone.now()
        return (self.start_date <= now) and (
            self.end_date is None or self.end_date >= now
        )

    def __str__(self):
        return self.message


class UserNotification(models.Model):
    """
    Represents a notification for a user.

    Attributes:
        user (OsmUser): The user to whom the notification belongs.
        is_read (bool): Whether the notification has been read.
        created_at (datetime): The time the notification was created.
        read_at (datetime): The time the notification was read.
        message (str): The notification message.
    """

    user = models.ForeignKey(
        OsmUser,
        to_field="osm_id",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    read_at = models.DateTimeField(null=True, blank=True)
    message = models.TextField(max_length=500)

    def mark_as_read(self):
        """
        Mark the notification as read.
        """
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}..."
