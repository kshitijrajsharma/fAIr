import { useMutation } from "@tanstack/react-query";
import {
  TUpdateUserProfileArgs,
  updateUserProfile,
} from "@/features/user-profile/api/update-user-profile";
import { MutationConfig } from "@/services";

type useUpdateProfileOptions = {
  mutationConfig?: MutationConfig<typeof updateUserProfile>;
};

export const useUpdateUserProfile = ({
  mutationConfig,
}: useUpdateProfileOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: (args: TUpdateUserProfileArgs) => updateUserProfile(args),
    onSuccess: (...args) => {
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
