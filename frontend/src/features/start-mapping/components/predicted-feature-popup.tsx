import maplibregl, { Map } from "maplibre-gl";
import { CheckIcon } from "@/components/ui/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { geojsonToWKT } from "@terraformer/wkt";
import { Input } from "@/components/ui/form";
import { SHOELACE_SIZES } from "@/enums";
import { showErrorToast } from "@/utils";
import { START_MAPPING_PAGE_CONTENT } from "@/constants";
import { useAuth } from "@/app/providers/auth-provider";
import { GeoJSONType } from "@/types";

import {
  useCreateApprovedModelPrediction,
  useCreateModelFeedback,
  useDeleteApprovedModelPrediction,
  useDeleteModelPredictionFeedback,
} from "@/features/start-mapping/hooks/use-feedbacks";
import {
  ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
  ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
  REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
} from "@/config";
import { useModelPredictionStore } from "@/store/model-prediction-store";

const PredictedFeatureActionPopup = ({
  trainingId,
  source_imagery,
  map,
}: {
  source_imagery: string;
  trainingId: number;
  map: Map | null;
}) => {
  const { user } = useAuth();
  const selectedFeatureRef = useRef<any>(null);
  const selectedEventRef = useRef<any>(null);
  const [showComment, setShowComment] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const { modelPredictions, moveFeatureBetweenBuckets } =
    useModelPredictionStore();

  const popupContainerRef = useRef<HTMLDivElement>(null);
  const popupInstanceRef = useRef<maplibregl.Popup | null>(null);

  const { accepted, rejected, all } = modelPredictions;
  const [featureId, setFeatureId] = useState<number | null>(null);

  const alreadyAccepted = useMemo(
    () => accepted.some((f) => f.properties.id === featureId),
    [accepted, featureId],
  );
  const alreadyRejected = useMemo(
    () => rejected.some((f) => f.properties.id === featureId),
    [rejected, featureId],
  );

  useEffect(() => {
    if (!map) return;

    const layerIds = [
      ALL_MODEL_PREDICTIONS_FILL_LAYER_ID,
      ACCEPTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
      REJECTED_MODEL_PREDICTIONS_FILL_LAYER_ID,
    ];

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleClick = (e: any) => {
      const clickedFeature = e.features?.[0];
      if (!clickedFeature) return;
      selectedEventRef.current = e;
      selectedFeatureRef.current = e.features?.[0];
      setFeatureId(clickedFeature.properties.id);
      // Reset if in comment mode
      setShowComment(false);

      if (popupContainerRef.current) {
        popupInstanceRef.current?.remove(); // remove old one if any
        const newPopup = new maplibregl.Popup({ closeButton: false })
          .setLngLat(e.lngLat)
          .setDOMContent(popupContainerRef.current)
          .addTo(map);
        popupInstanceRef.current = newPopup;
      }
    };

    layerIds.forEach((layerId) => {
      map.on("mouseenter", layerId, handleMouseEnter);
      map.on("mouseleave", layerId, handleMouseLeave);
      map.on("click", layerId, handleClick);
    });

    return () => {
      popupInstanceRef.current?.remove();
      layerIds.forEach((layerId) => {
        map.off("mouseenter", layerId, handleMouseEnter);
        map.off("mouseleave", layerId, handleMouseLeave);
        map.off("click", layerId, handleClick);
      });
    };
  }, [map]);

  // if already accepted, it means it's in accepted array
  // if it's already rejected, it means it's in the rejected array
  // if it's not in accepted or rejected, then it's in the all array
  const feature = useMemo(() => {
    return (
      accepted.find((f) => f.properties.id === featureId) ||
      rejected.find((f) => f.properties.id === featureId) ||
      all.find((f) => f.properties.id === featureId)
    );
  }, [featureId, accepted, rejected, all]);

  const closePopup = () => {
    popupInstanceRef.current?.remove();
    setShowComment(false);
    setComment("");
  };

  const handleRejection = () => {
    setShowComment(true);
  };

  // Approved prediction is accept

  const createApprovedModelPredictionMutation =
    useCreateApprovedModelPrediction({
      mutationConfig: {
        onSuccess: (data) => {
          const from = alreadyRejected ? "rejected" : "all";
          if (featureId !== null) {
            moveFeatureBetweenBuckets(from, "accepted", featureId, {
              _id: data.id,
              ...data.properties,
            });
          }

          closePopup();
        },

        onError: (error) => {
          showErrorToast(error);
        },
      },
    });

  const deleteModelFeedbackMutation = useDeleteModelPredictionFeedback({
    mutationConfig: {
      onSuccess: (_, variables) => {
        if (variables.approvePrediction) {
          submitApprovedPrediction();
        } else {
          if (featureId !== null) {
            moveFeatureBetweenBuckets("rejected", "all", featureId);
          }
        }
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const deleteApprovedModelPrediction = useDeleteApprovedModelPrediction({
    mutationConfig: {
      onSuccess: async (_, variables) => {
        if (variables.createFeedback) {
          await createModelFeedbackMutation.mutateAsync({
            zoom_level: feature?.properties.config.zoom_level as number,
            comments: comment,
            geom: geojsonToWKT(feature?.geometry as GeoJSONType),
            feedback_type: "TN",
            source_imagery: source_imagery,
            training: trainingId,
          });
        } else {
          if (featureId !== null) {
            moveFeatureBetweenBuckets("accepted", "all", featureId);
          }
          // const { updatedSource: updatedAccepted } = moveFeature(
          //   accepted,
          //   all,
          //   featureId,
          // );
          // setModelPredictions((prev) => ({
          //   ...prev,
          //   all: [
          //     ...all,
          //     ...accepted.filter((f) => f.properties.id === featureId),
          //   ],
          //   accepted: updatedAccepted,
          // }));
        }
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const submitApprovedPrediction = async () => {
    await createApprovedModelPredictionMutation.mutateAsync({
      geom: geojsonToWKT(feature?.geometry as GeoJSONType),
      training: trainingId,
      config: {
        // Use the configuration when the prediction was made.
        area_threshold: feature?.properties.config.area_threshold as number,
        confidence: feature?.properties.config.confidence as number,
        use_josm_q: feature?.properties.config.use_josm_q as boolean,
        max_angle_change: feature?.properties.config.max_angle_change as number,
        skew_tolerance: feature?.properties.config.skew_tolerance as number,
        tolerance: feature?.properties.config.tolerance as number,
        zoom_level: feature?.properties.config.zoom_level as number,
      },
      user: user.osm_id,
    });
  };

  // Rejection is the same as feedback
  const createModelFeedbackMutation = useCreateModelFeedback({
    mutationConfig: {
      onSuccess: (data) => {
        const source = alreadyAccepted ? "accepted" : "all";
        if (featureId !== null) {
          moveFeatureBetweenBuckets(source, "rejected", featureId, {
            _id: data.id,
          });
        }
        closePopup();
      },
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  const submitRejectionFeedback = async () => {
    if (alreadyAccepted) {
      await deleteApprovedModelPrediction.mutateAsync({
        id: feature?.properties._id as number,
        createFeedback: true,
      });
    } else {
      await createModelFeedbackMutation.mutateAsync({
        zoom_level: feature?.properties.config.zoom_level as number,
        comments: comment,
        geom: geojsonToWKT(feature?.geometry as GeoJSONType),
        feedback_type: "TN",
        source_imagery: source_imagery,
        training: trainingId,
      });
    }
  };

  const handleResolve = async () => {
    if (alreadyRejected) {
      await deleteModelFeedbackMutation.mutateAsync({
        id: feature?.properties._id as number,
      });
    } else if (alreadyAccepted) {
      await deleteApprovedModelPrediction.mutateAsync({
        id: feature?.properties._id as number,
      });
    }
    closePopup();
  };

  const handleAcceptance = async () => {
    if (alreadyRejected) {
      await deleteModelFeedbackMutation.mutateAsync({
        id: feature?.properties._id as number,
        approvePrediction: true,
      });
    } else {
      submitApprovedPrediction();
    }
  };

  const primaryButton = alreadyAccepted
    ? {
        label: START_MAPPING_PAGE_CONTENT.map.popup.reject,
        action: handleRejection,
        className: "bg-primary",
        icon: RejectIcon,
      }
    : alreadyRejected
      ? {
          label: START_MAPPING_PAGE_CONTENT.map.popup.resolve,
          action: handleResolve,
          className: "bg-black",
          icon: ResolveIcon,
        }
      : {
          label: START_MAPPING_PAGE_CONTENT.map.popup.accept,
          action: handleAcceptance,
          className: "bg-green-primary",
          icon: AcceptIcon,
        };

  const secondaryButton = alreadyAccepted
    ? {
        label: START_MAPPING_PAGE_CONTENT.map.popup.resolve,
        action: handleResolve,
        className: "bg-black",
        icon: ResolveIcon,
      }
    : alreadyRejected
      ? {
          label: START_MAPPING_PAGE_CONTENT.map.popup.accept,
          action: handleAcceptance,
          className: "bg-green-primary",
          icon: AcceptIcon,
        }
      : {
          label: START_MAPPING_PAGE_CONTENT.map.popup.reject,
          action: handleRejection,
          className: "bg-primary",
          icon: RejectIcon,
        };

  return (
    <div
      className="bg-white p-4 rounded-xl flex flex-col gap-y-4 w-fit md:w-[300px]"
      ref={popupContainerRef}
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold text-body-3 md:text-body-2base">
          {showComment
            ? START_MAPPING_PAGE_CONTENT.map.popup.commentTitle
            : START_MAPPING_PAGE_CONTENT.map.popup.defaultTitle}
        </p>
        <button
          className="text-dark text-sm md:text-lg self-end"
          onClick={closePopup}
          title="Close"
        >
          &#x2715;
        </button>
      </div>
      {showComment && (
        <Input
          handleInput={(e) => setComment(e.target.value)}
          value={comment}
          showBorder
          label={START_MAPPING_PAGE_CONTENT.map.popup.comment.description}
          placeholder={START_MAPPING_PAGE_CONTENT.map.popup.comment.placeholder}
          size={SHOELACE_SIZES.MEDIUM}
        />
      )}
      {showComment && (
        <button
          className={`w-fit bg-primary text-white rounded-lg px-6 py-2 text-body-4 md:text-body-3 text-nowrap`}
          onClick={submitRejectionFeedback}
          disabled={createModelFeedbackMutation.isPending}
        >
          {createModelFeedbackMutation.isPending
            ? START_MAPPING_PAGE_CONTENT.map.popup.comment.submissionInProgress
            : START_MAPPING_PAGE_CONTENT.map.popup.comment.submit}
        </button>
      )}
      {!showComment && (
        <p className="text-xs md:text-sm">
          {START_MAPPING_PAGE_CONTENT.map.popup.description}
        </p>
      )}
      {!showComment && (
        <div className="flex justify-between items-center gap-x-6">
          <button
            className={`w-full ${primaryButton.className} text-white rounded-lg p-2 text-body-4 md:text-body-3 text-nowrap flex gap-x-3 justify-between items-center`}
            onClick={primaryButton.action}
          >
            {primaryButton.label}
            <primaryButton.icon />
          </button>
          <button
            className={`w-full ${secondaryButton.className} text-white rounded-lg p-2 text-body-4 md:text-body-3 text-nowrap flex justify-between items-center gap-x-3`}
            onClick={secondaryButton.action}
          >
            {secondaryButton.label}
            <secondaryButton.icon />
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictedFeatureActionPopup;

const RejectIcon = () => {
  return (
    <span className="w-4 h-4 p-1 text-xs border rounded-full flex items-center justify-center">
      &#x2715;
    </span>
  );
};

const AcceptIcon = () => {
  return (
    <span className="w-4 h-4 border rounded-full flex items-center justify-center">
      <CheckIcon className="w-2 h-2" />
    </span>
  );
};

const ResolveIcon = () => {
  return (
    <span className="w-4 h-4 border rounded-full flex items-center justify-center">
      -
    </span>
  );
};
