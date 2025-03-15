import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { MobileDrawer } from "@/components/ui/drawer";
import { Popup } from "@/components/ui/popup";
import { TNotification } from "@/types";
import { formatDate, showErrorToast } from "@/utils";
import {
  useUpdateNotification,
  useUpdateNotifications,
} from "@/features/user-profile/hooks/use-notifications";
import { NoTrainingAreaIcon } from "@/components/ui/icons";
import { useEffect } from "react";

export const NotificationPanel = ({
  anchor,
  active,
  isError,
  isPending,
  notifications,
  unRead,
  setUnread,
  isSmallViewport,
  setShowNotificationPanel,
}: {
  anchor: string;
  active: boolean;
  isError: boolean;
  isPending: boolean;
  notifications: TNotification[];
  unRead: boolean | undefined;
  setUnread: (unRead: boolean | undefined) => void;
  isSmallViewport: boolean;
  setShowNotificationPanel: (show: boolean) => void;
}) => {
  const {
    isPending: isNotificationsUpdatePending,
    mutate: updateNotifications,
  } = useUpdateNotifications({
    mutationConfig: {
      onError: (error) => {
        showErrorToast(error);
      },
    },
  });

  useEffect(() => {
    // Only enable this on web because there is a close button already on mobile.
    if (isSmallViewport) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#popup-content")) {
        setShowNotificationPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const popUpContent = () => {
    return (
      <>
        <div className="px-2 space-y-2">
          <p className="font-semibold text-body-3 md:text-body-2">
            Notification
          </p>
          <Divider />
          <div className="flex justify-between">
            <div className="flex gap-x-2">
              <Button
                variant={unRead !== undefined ? "default" : "tertiary"}
                size="small"
                className={`!w-fit ${unRead === undefined ? "font-bold" : ""}`}
                uppercase={false}
                contentClassName="text-body-4"
                onClick={() => setUnread(undefined)}
              >
                All
              </Button>
              <Button
                variant={unRead !== false ? "default" : "tertiary"}
                size="small"
                className={`!w-fit ${unRead === false ? "font-bold" : ""}`}
                uppercase={false}
                contentClassName="text-body-4"
                onClick={() => setUnread(false)}
              >
                Unread
              </Button>
            </div>
            <button
              disabled={isNotificationsUpdatePending}
              className="text-gray text-body-4"
              onClick={() => updateNotifications(undefined)}
            >
              Mark all as read
            </button>
          </div>
        </div>
        <div className="h-96 max-h-96 overflow-y-auto scrollable flex flex-col gap-y-4 py-5">
          {isPending ? (
            <NotificationSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center gap-y-4">
              <p className="text-center text-primary text-body-3">
                Error loading notifications
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center gap-y-4 w-full h-full flex-col">
              <NoTrainingAreaIcon className="w-10 h-10" />
              <p className="text-gray text-body-3"> No new notifications.</p>
            </div>
          ) : (
            <div className="flex gap-y-4 flex-col">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  currentFilter={unRead}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const closeDrawer = () => {
    setShowNotificationPanel(false);
  };

  if (isSmallViewport) {
    return (
      <MobileDrawer
        open={active}
        dialogTitle=""
        snapPoints={[0.6, 0.8]}
        canClose
        closeDrawer={closeDrawer}
      >
        <div className={` w-full p-3 py-4 flex flex-col gap-y-4`}>
          {popUpContent()}
        </div>
      </MobileDrawer>
    );
  }
  return (
    <Popup
      active={active}
      anchor={anchor}
      placement="bottom-end"
      distance={20}
      skidding={30}
    >
      <div
        className={`border w-96 p-3 py-4 flex flex-col gap-y-4 border-gray-border shadow-2xl rounded-2xl bg-white`}
        id="popup-content"
      >
        {popUpContent()}
      </div>
    </Popup>
  );
};

const NotificationItem = ({
  notification,
  currentFilter
}: {
  notification: TNotification;
  currentFilter: boolean | undefined;
}) => {
  const { isPending, mutate } = useUpdateNotification({ currentFilter: currentFilter });

  return (
    <div className="flex flex-col gap-y-4 px-2 py-3 items-start transition-colors duration-200 justify-between rounded-lg w-full hover:bg-gray-border cursor-pointer group">
      <div className="flex w-full">
        <div className="w-3/4">
          <p className="text-body-4 h-1/2">{notification.message}</p>
        </div>
        <div className="w-1/4 flex items-center justify-end">
          {!notification.is_read && (
            <span className="w-2 h-2 bg-primary rounded-full" />
          )}
        </div>
      </div>
      <div className="w-full flex justify-between items-center group">
        <p className="text-body-4 text-gray">
          {formatDate(notification.created_at)}
        </p>
        {!notification.is_read && (
          <Button
            variant="default"
            size="small"
            disabled={isPending}
            className="!w-fit invisible duration-50 transition-all group-hover:visible shadow-lg"
            uppercase={false}
            contentClassName="text-body-4"
            onClick={() => mutate({ id: notification.id })}
          >
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
};

const NotificationSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse flex space-x-4 mb-4 w-full h-8 bg-light-gray"
        ></div>
      ))}
    </>
  );
};
