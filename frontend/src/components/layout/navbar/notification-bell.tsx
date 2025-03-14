import { NotificationBellIcon } from "@/components/ui/icons";

export const NotificationBell = ({
  setShowNotificationPanel,
  showNotificationPanel,
  notificationExists,
  notificationAnchor,
}: {
  showNotificationPanel: boolean;
  notificationExists: boolean;
  setShowNotificationPanel: (showNotificationPanel: boolean) => void;
  notificationAnchor: string;
}) => {
  return (
    <button
      id={notificationAnchor}
      className={`p-1  hover:bg-hover-accent rounded-md cursor-pointer ${showNotificationPanel ? "bg-hover-accent" : ""}`}
      onClick={() => setShowNotificationPanel(!showNotificationPanel)}
    >
      <div className="relative">
        <NotificationBellIcon className="w-5 h-5" />
        <div
          className={`w-2 h-2 text-white rounded-full absolute top-0 right-0 flex items-center justify-center ${notificationExists ? "bg-primary" : "bg-gray"}`}
        ></div>
      </div>
    </button>
  );
};
