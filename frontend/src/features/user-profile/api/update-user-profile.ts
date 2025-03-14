import { API_ENDPOINTS, apiClient } from "@/services";
import { TUser } from "@/types";

export type TUpdateUserProfileArgs = {
  email?: string;
  notifications_delivery_methods?: string[];
  newsletter_subscription?: boolean;
};

export const updateUserProfile = async ({
  email,
  newsletter_subscription,
  notifications_delivery_methods
}: TUpdateUserProfileArgs): Promise<TUser> => {
  return await (
    await apiClient.patch(API_ENDPOINTS.USER, {
      email,
      newsletter_subscription,
      notifications_delivery_methods
    })
  ).data;
};
