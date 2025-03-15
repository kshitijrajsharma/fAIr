import { useAuth } from "@/app/providers/auth-provider";
import { NotificationBellIcon } from "@/components/ui/icons";

export const NotificationBell = ({
  setShowNotificationPanel,
  showNotificationPanel,
  notificationAnchor,
}: {
  showNotificationPanel: boolean;
  setShowNotificationPanel: (showNotificationPanel: boolean) => void;
  notificationAnchor: string;
}) => {
  const { user } = useAuth();

  return (
    <button
      id={notificationAnchor}
      className={`p-1  hover:bg-hover-accent rounded-md cursor-pointer ${showNotificationPanel ? "bg-hover-accent" : ""}`}
      onClick={() => setShowNotificationPanel(!showNotificationPanel)}
    >
      <div className="relative">
        <NotificationBellIcon className="w-5 h-5" />
        <div
          className={`w-2 h-2 text-white rounded-full absolute top-0 right-0 flex items-center justify-center ${user.unread_notifications_count > 0 ? "bg-primary" : "bg-gray"}`}
        ></div>
      </div>
    </button>
  );
};
