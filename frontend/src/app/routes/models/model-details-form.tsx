import { useModelsContext } from "@/app/providers/models-provider";
import { ModelDetailsForm } from "@/features/model-creation/components/";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const ModelDetailsFormPage = () => {
  const { resetState } = useModelsContext();
  const { modelId } = useParams();
  /**
   *  Reset the state on first load during creation.
   *  Don't reset it in edit mode.
   */
  useEffect(() => {
    if (!!modelId) return
    resetState()
  }, [resetState]);

  return (
    <div
      className={
        "col-span-12 md:col-start-2 md:col-span-10 lg:col-start-4 lg:col-span-6"
      }
    >
      <ModelDetailsForm />
    </div>
  );
};
