import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getNotifications } from "./notifications";

type TUserNotificationsQueryOptions = {
  offset?: number;
  is_read: boolean | undefined;
};

export const getUserNotificationsQueryOptions = ({
  offset,
  is_read,
}: TUserNotificationsQueryOptions) => {
  return queryOptions({
    queryKey: [
      "notifications",
      {
        offset,
        is_read,
      },
    ],
    queryFn: () => getNotifications(is_read, offset),
    placeholderData: keepPreviousData,
  });
};
