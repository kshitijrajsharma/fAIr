import { useState } from "react";
import { useNotifications } from "@/features/user-profile/hooks/use-notifications";
import { useAuth } from "@/app/providers/auth-provider";
import useScreenSize from "@/hooks/use-screen-size";
import { NotificationBell } from "@/components/layout";
import { NotificationPanel } from "./notifications-panel";


const SMALL_VIEWPORT = 960;

export enum NotificationType {
  ALL = "all",
  UNREAD = "unread",
}

export const UserNotifications = () => {
  const [showNotificationPanel, setShowNotificationPanel] =
    useState<boolean>(false);

  const { user } = useAuth();

  const notificationAnchor = "notificationPanel";

  const { screenWidth } = useScreenSize();

  const [notificationType, setNotificationType] = useState<NotificationType>(
    NotificationType.UNREAD,
  );

  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetching } =
    useNotifications({
      enabled: true,
      is_read: undefined,
    });

  const handleClick = () => {
    setShowNotificationPanel((prev) => !prev);
  };

  return (
    <>
      <NotificationBell
        showNotificationPanel={showNotificationPanel}
        notificationAnchor={notificationAnchor}
        unreadCount={user?.unread_notifications_count}
        handleClick={handleClick}

      />

      <NotificationPanel
        showNotificationPanel={showNotificationPanel}
        setShowNotificationPanel={setShowNotificationPanel}
        unReadNotifications={data?.pages
          .map((page) => page.results)
          .flat()
          .filter((notification) => !notification.is_read)}
        allNotifications={data?.pages.map((page) => page.results).flat()}
        isPending={isPending}
        isError={isError}
        loadMore={fetchNextPage}
        anchor={notificationAnchor}
        notificationType={notificationType}
        setNotificationType={setNotificationType}
        isSmallViewport={screenWidth < SMALL_VIEWPORT}
        unreadCount={user?.unread_notifications_count}
        hasNextPage={hasNextPage}
        isFetching={isFetching}
      />
    </>
  );
};
