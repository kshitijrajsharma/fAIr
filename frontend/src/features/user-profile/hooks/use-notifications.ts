import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserNotificationsQueryOptions } from "../api/factory";
import {
  TUpdateNotificationArgs,
  updateNotification,
  updateNotifications,
} from "../api/notifications";
import { MutationConfig } from "@/services";

type UseNotificationsOptions = {
  offset?: number;
  enabled: boolean;
  is_read: boolean | undefined;
};

export const useNotifications = ({
  offset,
  enabled,
  is_read,
}: UseNotificationsOptions) => {
  return useQuery({
    ...getUserNotificationsQueryOptions({
      is_read,
      offset,
    }),
    enabled: enabled,
    // Refetch every 10 seconds.
    refetchInterval: 10000,
  });
};

type useUpdateNotificationOptions = {
  mutationConfig?: MutationConfig<typeof updateNotification>;
  currentFilter?: boolean | undefined;
};

export const useUpdateNotification = ({
  mutationConfig,
  currentFilter
}: useUpdateNotificationOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const { refetch } = useNotifications({ is_read: currentFilter, enabled: true });
  return useMutation({
    mutationFn: (args: TUpdateNotificationArgs) => updateNotification(args),
    onSuccess: (...args) => {
      refetch();
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};

type useUpdateNotificationsOptions = {
  mutationConfig?: MutationConfig<typeof updateNotifications>;
};

export const useUpdateNotifications = ({
  mutationConfig,
}: useUpdateNotificationsOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const { refetch } = useNotifications({ is_read: undefined, enabled: true });
  return useMutation({
    mutationFn: () => updateNotifications(),
    onSuccess: (...args) => {
      refetch();
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
