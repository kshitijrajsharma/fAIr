import { useMutation } from "@tanstack/react-query";
import { MutationConfig } from "@/services";
import {
  createTrainingDataset,
  TCreateTrainingDatasetArgs,
} from "@/features/model-creation/api/create-trainings";

type useCreateTrainingDatasetOptions = {
  mutationConfig?: MutationConfig<typeof createTrainingDataset>;
};

export const useCreateTrainingDataset = ({
  mutationConfig,
}: useCreateTrainingDatasetOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: (args: TCreateTrainingDatasetArgs) =>
      createTrainingDataset(args),
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
