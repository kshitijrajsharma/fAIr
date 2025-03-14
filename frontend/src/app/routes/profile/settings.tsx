import { useAuth } from "@/app/providers/auth-provider";
import { Button, ButtonWithIcon } from "@/components/ui/button";
import { Input, Switch } from "@/components/ui/form";
import { DeleteIcon } from "@/components/ui/icons";
import { INPUT_TYPES } from "@/enums";
import { useUpdateUserProfile } from "@/features/user-profile/hooks/use-user-profile";
import { showErrorToast, showSuccessToast, truncateString } from "@/utils";
import { useState } from "react";

const notificationKeys = {
  monthlyNewsletter: "monthlyNewsletter",
  emailTrainingNotification: "emailTrainingNotification",
  webTrainingNotification: "webTrainingNotification",
};

type NotificationType = {
  label: string;
  key: keyof typeof notificationKeys;
  description: string;
};

const notificationTypes: NotificationType[] = [
  {
    label: "Monthly Newsletter",
    key: "monthlyNewsletter",
    description: "Subscribe to our monthly newsletter.",
  },
  {
    label: "Email Training Notification",
    key: "emailTrainingNotification",
    description: "Receive training notifications via email.",
  },
  {
    label: "Web Training Notification",
    key: "webTrainingNotification",
    description: "Receive training notifications via fAIr web.",
  },
];

export const UserProfileSettingsPage = () => {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState<string>(user?.email || "");
  const [validity, setValidity] = useState<{ valid: boolean; message: string }>(
    {
      valid: true,
      message: "",
    },
  );

  const [showForm, setShowForm] = useState<boolean>(user?.email.length === 0);
  const [hasPressedSubmit, setHasPressedSubmit] = useState<boolean>(false);

  const { mutate, isPending } = useUpdateUserProfile({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast("Update successful.");
        if (hasPressedSubmit) {
          setShowForm(false);
          setHasPressedSubmit(false);
        }
        setUser(data);
      },
      onError: (error) => {
        showErrorToast(error, "Error updating user profile.");
      },
    },
  });

  const [notifications, setNotifications] = useState<{
    monthlyNewsletter: boolean;
    emailTrainingNotification: boolean;
    webTrainingNotification: boolean;
  }>({
    monthlyNewsletter: user?.newsletter_subscription,
    emailTrainingNotification:
      user.notifications_delivery_methods.includes("email"),
    webTrainingNotification:
      user.notifications_delivery_methods.includes("web"),
  });

  const handleEmailSubmit = () => {
    setHasPressedSubmit(true);
    mutate({ email });
  };

  return (
    <div className="flex justify-center items-center">
      <div className="w-full md:max-w-[400px] flex flex-col gap-y-10">
        {!showForm && (
          <div className="flex flex-col md:flex-row gap-y-2 md:gap-0 justify-between md:items-center">
            <p className="text-body-3 md:text-body-2">
              {truncateString(email)}
            </p>
            <Button
              variant="tertiary"
              onClick={() => setShowForm(true)}
              uppercase={false}
              className="!w-fit"
              contentClassName="md:!p-0.5 text-body-4"
              size="small"
            >
              Change email
            </Button>
          </div>
        )}
        {showForm && (
          <div className="flex flex-col gap-y-6">
            <SectionHeader sectionTitle="Email email address" />
            <div className="mt-2 flex flex-col space-y-6">
              <Input
                label="Email"
                showBorder
                type={INPUT_TYPES.EMAIL}
                placeholder="Enter your email address"
                value={email}
                handleInput={(e) => setEmail(e.target.value)}
                validationStateUpdateCallback={(e) => setValidity(e)}
              />
              {validity.message && (
                <small className="text-primary">{validity.message}</small>
              )}
              <Button
                disabled={!validity.valid || email.length === 0 || isPending}
                type="submit"
                onClick={handleEmailSubmit}
                className="!w-fit"
                uppercase={false}
                contentClassName="!px-4 py-2"
                size="small"
              >
                {isPending ? "Submitting" : "Submit"}
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-y-6">
          <SectionHeader sectionTitle="Notifications" />
          <div className="mt-2 space-y-4">
            {notificationTypes.map((notification, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <div
                  className={`flex justify-between items-center transition-opacity duration-200 ${user.email.length === 0 && notification.key !== notificationKeys.webTrainingNotification ? "opacity-50" : ""}`}
                >
                  <div className="flex flex-col gap-y-1">
                    <h3 className="text-body-3 md:text-body-2">
                      {notification.label}
                    </h3>
                    <p className="text-body-4 md:text-body-3 text-gray">
                      {notification.description}
                    </p>
                  </div>
                  <Switch
                    disabled={isPending}
                    checked={notifications[notification.key]}
                    handleSwitchChange={(e) => {
                      const updatedNotifications = {
                        ...notifications,
                        [notification.key]: e.target.checked,
                      };
                      mutate({
                        newsletter_subscription: updatedNotifications.monthlyNewsletter,
                        notifications_delivery_methods: [
                          ...(updatedNotifications.emailTrainingNotification ? ["email"] : []),
                          ...(updatedNotifications.webTrainingNotification ? ["web"] : []),
                        ],
                      }, {
                        onSuccess: () => {
                          setNotifications(updatedNotifications);
                        },
                        onError: (error) => {
                          showErrorToast(error, "Error updating notifications");
                        },
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-6">
          <SectionHeader sectionTitle="Account" />
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-1">
              <p className="text-body-3 md:text-body-2">Delete Account</p>
              <p className="text-gray text-body-3">If you no longer want to use fAIr, request to delete your account.</p>
            </div>
            <ButtonWithIcon
              label="Delete My Account"
              variant="primary"
              prefixIcon={DeleteIcon}
              uppercase={false}
              className="!w-fit"
              textClassName="p-0.5 md:px-1 md:py-2 text-body-4"
              size="small" />
          </div>

        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ sectionTitle }: { sectionTitle: string }) => {
  return (
    <div>
      <h2 className="text-body-1 md:text-title-3 font-semibold">
        {sectionTitle}
      </h2>
    </div>
  );
};
