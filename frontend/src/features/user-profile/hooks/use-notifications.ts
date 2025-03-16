import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserNotificationsQueryOptions } from "../api/factory";

import {
  TUpdateNotificationArgs,
  updateNotification,
  updateNotifications,
} from "../api/notifications";
import { MutationConfig } from "@/services";

type UseNotificationsOptions = {
  enabled: boolean;
  is_read: boolean | undefined;
  offset: number;
};

export const useNotifications = ({
  enabled,
  is_read,
  offset,
}: UseNotificationsOptions) => {
  return useQuery({
    ...getUserNotificationsQueryOptions({ is_read, offset }),
    enabled,
    refetchInterval: 10000,
  });
};

type useUpdateNotificationOptions = {
  mutationConfig?: MutationConfig<typeof updateNotification>;
  isRead: boolean | undefined;
  offset: number;
};

export const useUpdateNotification = ({
  mutationConfig,
  isRead,
  offset,
}: useUpdateNotificationOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const { refetch } = useNotifications({
    is_read: isRead,
    enabled: false,
    offset,
  });
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
  offset: number;
};

export const useUpdateNotifications = ({
  mutationConfig,
  offset,
}: useUpdateNotificationsOptions) => {
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const { refetch } = useNotifications({
    is_read: undefined,
    enabled: false,
    offset,
  });
  return useMutation({
    mutationFn: () => updateNotifications(),
    onSuccess: (...args) => {
      refetch();
      onSuccess?.(...args);
    },
    ...restConfig,
  });
};
