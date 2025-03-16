import mercantile
from django.conf import settings
from login.models import OsmUser
from rest_framework import serializers
from rest_framework_gis.serializers import (
    GeoFeatureModelSerializer,  # this will be used if we used to serialize as geojson
)

from .models import *

# from .tasks import train_model


class DatasetSerializer(serializers.ModelSerializer):
    """
    Serializer for the Dataset model.

    This serializer provides fields for the Dataset model and includes a method to get the count of associated models.
    """
    models_count = serializers.SerializerMethodField()

    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "source_imagery",
            "last_modified",
            "created_at",
            "status",
            "models_count",
            "user",
        ]
        read_only_fields = (
            "user",
            "created_at",
            "last_modified",
            "models_count",
        )

    def create(self, validated_data):
        """
        Create a new Dataset instance.

        Args:
            validated_data (dict): The validated data for creating the Dataset.

        Returns:
            Dataset: The created Dataset instance.
        """
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def get_models_count(self, obj):
        """
        Get the count of models associated with the dataset.

        Args:
            obj (Dataset): The Dataset instance.

        Returns:
            int: The count of associated models.
        """
        return Model.objects.filter(dataset=obj).count()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the OsmUser model.

    This serializer provides fields for the OsmUser model.
    """
    class Meta:
        model = OsmUser
        fields = [
            "osm_id",
            "username",
        ]

    read_only_fields = ["osm_id", "username"]


class ModelSerializer(serializers.ModelSerializer):
    """
    Serializer for the Model model.

    This serializer provides fields for the Model model and includes methods to get the accuracy and thumbnail URL.
    """
    user = UserSerializer(read_only=True)
    accuracy = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Model
        fields = [
            "id",
            "dataset",
            "name",
            "created_at",
            "last_modified",
            "description",
            "user",
            "published_training",
            "status",
            "base_model",
            "accuracy",
            "thumbnail_url",
        ]
        read_only_fields = (
            "created_at",
            "last_modified",
            "user",
            "published_training",
        )

    def create(self, validated_data):
        """
        Create a new Model instance.

        Args:
            validated_data (dict): The validated data for creating the Model.

        Returns:
            Model: The created Model instance.
        """
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def __init__(self, *args, **kwargs):
        """
        Initialize the ModelSerializer.

        This method overrides the dataset field for detail views.
        """
        super(ModelSerializer, self).__init__(*args, **kwargs)
        request = self.context.get("request")
        if (
            request
            and request.resolver_match
            and request.resolver_match.kwargs.get("pk")
        ):
            self.fields["dataset"] = DatasetSerializer(read_only=True)

    def get_thumbnail_url(self, obj):
        """
        Get the thumbnail URL for the model.

        Args:
            obj (Model): The Model instance.

        Returns:
            str: The thumbnail URL.
        """
        training = Training.objects.filter(id=obj.published_training).first()

        if training:
            if training.source_imagery:
                aoi = AOI.objects.filter(dataset=obj.dataset).first()
                if aoi and aoi.geom:
                    centroid = (
                        aoi.geom.centroid.coords
                    )
                    try:
                        tile = mercantile.tile(centroid[0], centroid[1], zoom=18)
                        return training.source_imagery.format(x=tile.x, y=tile.y, z=18)
                    except Exception as ex:
                        pass
        return None

    def get_accuracy(self, obj):
        """
        Get the accuracy of the model.

        Args:
            obj (Model): The Model instance.

        Returns:
            float: The accuracy of the model.
        """
        training = Training.objects.filter(id=obj.published_training).first()
        if training:
            return training.accuracy
        return None


class ModelCentroidSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the Model model with centroid geometry.

    This serializer provides fields for the Model model and includes a method to get the centroid geometry.
    """
    geometry = serializers.SerializerMethodField()
    mid = serializers.IntegerField(source="id")

    class Meta:
        model = Model
        geo_field = "geometry"
        fields = ("mid", "geometry")

    def get_geometry(self, obj):
        """
        Get the centroid of the AOI linked to the dataset of the given model.

        Args:
            obj (Model): The Model instance.

        Returns:
            dict: The centroid geometry.
        """
        aoi = AOI.objects.filter(dataset=obj.dataset).first()
        if aoi and aoi.geom:
            return {
                "type": "Point",
                "coordinates": aoi.geom.centroid.coords,
            }
        return None


class AOISerializer(GeoFeatureModelSerializer):
    """
    Serializer for the AOI model.

    This serializer provides fields for the AOI model.
    """
    class Meta:
        model = AOI
        geo_field = "geom"
        fields = [
            "id",
            "dataset",
            "geom",
            "label_status",
            "label_fetched",
            "created_at",
            "last_modified",
            "user",
        ]
        read_only_fields = (
            "created_at",
            "last_modified",
            "label_fetched",
            "label_status",
            "user",
        )

    def create(self, validated_data):
        """
        Create a new AOI instance.

        Args:
            validated_data (dict): The validated data for creating the AOI.

        Returns:
            AOI: The created AOI instance.
        """
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Update an existing AOI instance.

        Args:
            instance (AOI): The AOI instance to update.
            validated_data (dict): The validated data for updating the AOI.

        Returns:
            AOI: The updated AOI instance.
        """
        request = self.context.get("request")
        if request and hasattr(request, "user"):
            validated_data["user"] = request.user
        return super().update(instance, validated_data)


class FeedbackAOISerializer(GeoFeatureModelSerializer):
    """
    Serializer for the FeedbackAOI model.

    This serializer provides fields for the FeedbackAOI model.
    """
    class Meta:
        model = FeedbackAOI
        geo_field = "geom"
        fields = [
            "id",
            "training",
            "geom",
            "label_status",
            "label_fetched",
            "created_at",
            "last_modified",
            "source_imagery",
            "user",
        ]
        partial = True
        read_only_fields = (
            "created_at",
            "last_modified",
            "label_fetched",
            "label_status",
            "user",
        )

    def create(self, validated_data):
        """
        Create a new FeedbackAOI instance.

        Args:
            validated_data (dict): The validated data for creating the FeedbackAOI.

        Returns:
            FeedbackAOI: The created FeedbackAOI instance.
        """
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)


class FeedbackSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the Feedback model.

    This serializer provides fields for the Feedback model.
    """
    class Meta:
        model = Feedback
        geo_field = "geom"
        fields = [
            "id",
            "geom",
            "training",
            "created_at",
            "zoom_level",
            "feedback_type",
            "comments",
            "user",
            "source_imagery",
        ]
        read_only_fields = ("created_at", "last_modified", "user")
        partial = True

    def create(self, validated_data):
        """
        Create a new Feedback instance.

        Args:
            validated_data (dict): The validated data for creating the Feedback.

        Returns:
            Feedback: The created Feedback instance.
        """
        user = self.context["request"].user
        validated_data["user"] = user
        return super().create(validated_data)

    def to_representation(self, instance):
        """
        Customize the representation of the Feedback instance.

        Args:
            instance (Feedback): The Feedback instance.

        Returns:
            dict: The customized representation of the Feedback instance.
        """
        ret = super().to_representation(instance)
        ret["properties"]["id"] = instance.id
        return ret


class LabelSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the Label model.

    This serializer provides fields for the Label model.
    """
    class Meta:
        model = Label
        geo_field = "geom"
        fields = [
            "id",
            "aoi",
            "geom",
            "osm_id",
            "tags",
            "created_at",
        ]


class ApprovedPredictionsSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the ApprovedPredictions model.

    This serializer provides fields for the ApprovedPredictions model.
    """
    class Meta:
        model = ApprovedPredictions
        geo_field = "geom"
        fields = [
            "id",
            "training",
            "config",
            "geom",
            "approved_at",
            "user",
        ]


class FeedbackLabelSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the FeedbackLabel model.

    This serializer provides fields for the FeedbackLabel model.
    """
    class Meta:
        model = FeedbackLabel
        geo_field = "geom"
        fields = [
            "id",
            "osm_id",
            "feedback_aoi",
            "tags",
            "geom",
            "created_at",
        ]


class LabelFileSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the Label model for file operations.

    This serializer provides fields for the Label model for file operations.
    """
    class Meta:
        model = Label
        geo_field = "geom"
        fields = ("osm_id", "tags")


class FeedbackLabelFileSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the FeedbackLabel model for file operations.

    This serializer provides fields for the FeedbackLabel model for file operations.
    """
    class Meta:
        model = FeedbackLabel
        geo_field = "geom"
        fields = ("osm_id", "tags")


class FeedbackFileSerializer(GeoFeatureModelSerializer):
    """
    Serializer for the Feedback model for file operations.

    This serializer provides fields for the Feedback model for file operations.
    """
    class Meta:
        fields = ("training",)
        model = Feedback
        geo_field = "geom"


class ImageDownloadSerializer(serializers.Serializer):
    """
    Serializer for image download parameters.

    This serializer provides fields for image download parameters.
    """
    dataset_id = serializers.IntegerField(required=True)
    zoom_level = serializers.ListField(required=True)

    class Meta:
        fields = ("dataset_id", "source", "zoom_level")

    def validate(self, data):
        """
        Validate the supplied data.

        Args:
            data (dict): The data to validate.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If the zoom level is not supported.
        """
        for i in data["zoom_level"]:
            if int(i) < 19 or int(i) > 21:
                raise serializers.ValidationError("Zoom level Supported between 19-21")
        return data


class FeedbackParamSerializer(serializers.Serializer):
    """
    Serializer for feedback parameters.

    This serializer provides fields for feedback parameters.
    """
    training_id = serializers.IntegerField(required=True)
    epochs = serializers.IntegerField(required=False)
    batch_size = serializers.IntegerField(required=False)
    zoom_level = serializers.ListField(child=serializers.IntegerField(), required=False)

    def validate_training_id(self, value):
        """
        Validate the training ID.

        Args:
            value (int): The training ID to validate.

        Returns:
            int: The validated training ID.

        Raises:
            serializers.ValidationError: If the training doesn't exist.
        """
        try:
            Training.objects.get(id=value)
        except Training.DoesNotExist:
            raise serializers.ValidationError("Training doesn't exist")

        return value

    def validate(self, data):
        """
        Validate the supplied data.

        Args:
            data (dict): The data to validate.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If the data is not valid.
        """
        training_id = data.get("training_id")

        try:
            fd_aois = FeedbackAOI.objects.filter(training=training_id)
        except FeedbackAOI.DoesNotExist:
            raise serializers.ValidationError(
                "No feedback AOI is associated with Training"
            )

        if fd_aois.filter(
            label_status=FeedbackAOI.DownloadStatus.NOT_DOWNLOADED
        ).exists():
            raise serializers.ValidationError(
                "Not all AOIs have their labels downloaded"
            )

        if "epochs" in data and (
            data["epochs"] > settings.EPOCHS_LIMIT or data["epochs"] <= 0
        ):
            raise serializers.ValidationError(
                f"Epochs should be 1 - {settings.EPOCHS_LIMIT} on this server"
            )

        if "batch_size" in data and (
            data["batch_size"] > settings.BATCH_SIZE_LIMIT or data["batch_size"] <= 0
        ):
            raise serializers.ValidationError(
                f"Batch size should be 1 - {settings.BATCH_SIZE_LIMIT} on this server"
            )

        if "zoom_level" in data:
            for zoom in data["zoom_level"]:
                if zoom < 19 or zoom > 21:
                    raise serializers.ValidationError(
                        "Zoom level must be between 19 and 21"
                    )

        return data


class PredictionParamSerializer(serializers.Serializer):
    """
    Serializer for prediction parameters.

    This serializer provides fields for prediction parameters.
    """
    bbox = serializers.ListField(child=serializers.FloatField(), required=True)
    model_id = serializers.IntegerField(required=True)
    zoom_level = serializers.IntegerField(required=True)
    use_josm_q = serializers.BooleanField(required=False)
    source = serializers.URLField(required=False)
    confidence = serializers.IntegerField(required=False)
    max_angle_change = serializers.IntegerField(required=False)
    skew_tolerance = serializers.IntegerField(required=False)
    tolerance = serializers.FloatField(required=False)
    area_threshold = serializers.FloatField(required=False)
    tile_overlap_distance = serializers.FloatField(required=False)

    def validate_max_angle_change(self, value):
        """
        Validate the max angle change.

        Args:
            value (int): The max angle change to validate.

        Returns:
            int: The validated max angle change.

        Raises:
            serializers.ValidationError: If the max angle change is not valid.
        """
        if value is not None:
            if value < 0 or value > 45:
                raise serializers.ValidationError(
                    f"Invalid Max Angle Change: {value}, Should be between 0 and 45"
                )
        return value

    def validate_skew_tolerance(self, value):
        """
        Validate the skew tolerance.

        Args:
            value (int): The skew tolerance to validate.

        Returns:
            int: The validated skew tolerance.

        Raises:
            serializers.ValidationError: If the skew tolerance is not valid.
        """
        if value is not None:
            if value < 0 or value > 45:
                raise serializers.ValidationError(
                    f"Invalid Skew Tolerance: {value}, Should be between 0 and 45"
                )
        return value

    def validate_tolerance(self, value):
        """
        Validate the tolerance.

        Args:
            value (float): The tolerance to validate.

        Returns:
            float: The validated tolerance.

        Raises:
            serializers.ValidationError: If the tolerance is not valid.
        """
        if value is not None:
            if value < 0 or value > 10:
                raise serializers.ValidationError(
                    f"Invalid Tolerance: {value}, Should be between 0 and 10"
                )
        return value

    def validate_tile_overlap_distance(self, value):
        """
        Validate the tile overlap distance.

        Args:
            value (float): The tile overlap distance to validate.

        Returns:
            float: The validated tile overlap distance.

        Raises:
            serializers.ValidationError: If the tile overlap distance is not valid.
        """
        if value is not None:
            if value < 0 or value > 1:
                raise serializers.ValidationError(
                    f"Invalid Tile Overlap Distance : {value}, Should be between 0 and 1"
                )
        return value

    def validate_area_threshold(self, value):
        """
        Validate the area threshold.

        Args:
            value (float): The area threshold to validate.

        Returns:
            float: The validated area threshold.

        Raises:
            serializers.ValidationError: If the area threshold is not valid.
        """
        if value is not None:
            if value < 0 or value > 20:
                raise serializers.ValidationError(
                    f"Invalid Area Threshold: {value}, Should be between 0 and 20"
                )
        return value

    def validate(self, data):
        """
        Validate the supplied data.

        Args:
            data (dict): The data to validate.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If the data is not valid.
        """
        if "confidence" in data:
            if data["confidence"] < 0 or data["confidence"] > 100:
                raise serializers.ValidationError(
                    f"""Invalid Confidence threshold : {data["confidence"]}, Should be between 0-100"""
                )
        if len(data["bbox"]) != 4:
            raise serializers.ValidationError("Not a valid bbox")
        if data["zoom_level"] < 18 or data["zoom_level"] > 22:
            raise serializers.ValidationError(
                f"""Invalid Zoom level : {data["zoom_level"]}, Supported between 18-22"""
            )

        if "max_angle_change" in data:
            data["max_angle_change"] = self.validate_max_angle_change(
                data["max_angle_change"]
            )

        if "skew_tolerance" in data:
            data["skew_tolerance"] = self.validate_skew_tolerance(
                data["skew_tolerance"]
            )

        if "tolerance" in data:
            data["tolerance"] = self.validate_tolerance(data["tolerance"])

        if "area_threshold" in data:
            data["area_threshold"] = self.validate_area_threshold(
                data["area_threshold"]
            )
        return data


class BannerSerializer(serializers.ModelSerializer):
    """
    Serializer for the Banner model.

    This serializer provides fields for the Banner model.
    """
    class Meta:
        model = Banner
        fields = [
            "id",
            "message",
            "start_date",
            "end_date",
        ]


class UserStatsSerializer(serializers.ModelSerializer):
    """
    Serializer for user statistics.

    This serializer provides fields for user statistics and includes methods to get various counts and profile completion percentage.
    """
    models_count = serializers.SerializerMethodField()
    datasets_count = serializers.SerializerMethodField()
    feedbacks_count = serializers.SerializerMethodField()
    approved_predictions_count = serializers.SerializerMethodField()
    profile_completion_percentage = serializers.SerializerMethodField()
    unread_notifications_count = serializers.SerializerMethodField()

    class Meta:
        model = OsmUser
        fields = [
            "osm_id",
            "username",
            "email",
            "date_joined",
            "img_url",
            "notifications_delivery_methods",
            "newsletter_subscription",
            "account_deletion_requested",
            "models_count",
            "datasets_count",
            "feedbacks_count",
            "approved_predictions_count",
            "profile_completion_percentage",
            "unread_notifications_count",
        ]
        read_only_fields = [
            "osm_id",
            "username",
            "date_joined",
            "img_url",
            "models_count",
            "datasets_count",
            "feedbacks_count",
            "approved_predictions_count",
            "profile_completion_percentage",
            "unread_notifications_count",
        ]

    def get_models_count(self, obj):
        """
        Get the count of models associated with the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The count of associated models.
        """
        return Model.objects.filter(user=obj).count()

    def get_datasets_count(self, obj):
        """
        Get the count of datasets associated with the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The count of associated datasets.
        """
        return Dataset.objects.filter(user=obj).count()

    def get_feedbacks_count(self, obj):
        """
        Get the count of feedbacks associated with the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The count of associated feedbacks.
        """
        return Feedback.objects.filter(user=obj).count()

    def get_approved_predictions_count(self, obj):
        """
        Get the count of approved predictions associated with the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The count of associated approved predictions.
        """
        return ApprovedPredictions.objects.filter(user=obj).count()

    def get_profile_completion_percentage(self, obj):
        """
        Get the profile completion percentage for the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The profile completion percentage.
        """
        profile_percentage = 25
        if obj.username is not None and obj.username != "":
            profile_percentage += 25
        if obj.img_url is not None and obj.img_url != "":
            profile_percentage += 25
        if obj.email is not None and obj.email != "":
            profile_percentage += 25
        return profile_percentage

    def get_unread_notifications_count(self, obj):
        """
        Get the count of unread notifications for the user.

        Args:
            obj (OsmUser): The OsmUser instance.

        Returns:
            int: The count of unread notifications.
        """
        return UserNotification.objects.filter(user=obj, is_read=False).count()


class UserNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserNotification model.

    This serializer provides fields for the UserNotification model.
    """
    class Meta:
        model = UserNotification
        fields = ("id", "is_read", "created_at", "read_at", "message")
        read_only_fields = (
            "id",
            "created_at",
            "read_at",
            "message",
        )
