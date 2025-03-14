import { useAuth } from "@/app/providers/auth-provider";
import { ModelFormConfirmation } from "@/assets/images";
import { DeleteModal } from "@/components/shared/modals";
import { Button, ButtonWithIcon } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Switch } from "@/components/ui/form";
import { DeleteIcon } from "@/components/ui/icons";
import { Image } from "@/components/ui/image";
import { INPUT_TYPES } from "@/enums";
import { useUpdateUserProfile } from "@/features/user-profile/hooks/use-user-profile";
import { useDialog } from "@/hooks/use-dialog";
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
    description: "Receive model training notifications via email.",
  },
  {
    label: "Web Training Notification",
    key: "webTrainingNotification",
    description: "Receive model training notifications via fAIr web.",
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

  const [isEmailPending, setIsEmailPending] = useState<boolean>(false);

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

  const [isNotificationPending, setIsNotificationPending] =
    useState<boolean>(false);

  const { mutate: updateEmail } = useUpdateUserProfile({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast("Email update successful.");
        setShowForm(false);
        setUser(data);
        setIsEmailPending(false);
      },
      onError: (error) => {
        showErrorToast(error, "Error updating email.");
        setIsEmailPending(false);
      },
    },
  });
  const { isOpened, openDialog, closeDialog } = useDialog();

  const {
    isOpened: isSuccessDialogOpened,
    openDialog: openSuccessDialog,
    closeDialog: closeSuccessDialog,
  } = useDialog();

  const {
    mutate: requestAccountDeletion,
    isPending: accountDeletionRequestIsPending,
  } = useUpdateUserProfile({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast("Account deletion request successful.");
        setUser(data);
        closeDialog();
        openSuccessDialog();
      },
      onError: (error) => {
        showErrorToast(error, "Account deletion request failed.");
      },
    },
  });

  const { mutate: updateNotifications } = useUpdateUserProfile({
    mutationConfig: {
      onSuccess: (data) => {
        showSuccessToast("Notifications update successful.");
        setUser(data);
        setIsNotificationPending(false);
      },
      onError: (error) => {
        showErrorToast(error, "Error updating notifications.");
        setIsNotificationPending(false);
      },
    },
  });

  const handleEmailSubmit = () => {
    setIsEmailPending(true);
    updateEmail({ email });
  };

  const handleDeleteAccount = () => {
    requestAccountDeletion({ account_deletion_requested: true });
  };

  return (
    <>
      {/* Delete success dialog */}
      <Dialog isOpened={isSuccessDialogOpened} closeDialog={closeSuccessDialog}>
        <div className="flex flex-col items-center gap-y-4 h-full w-full justify-center">
          <Image
            src={ModelFormConfirmation}
            alt="Model Creation Success Icon"
          />
          <h1 className="text-title-3 font-semibold">Delete Request Sent</h1>
          <p className="text-body-3 text-center">
            We have received the request to delete your account, a member of our
            team would be in touch with you.
          </p>
          <div className="flex  w-full items-center justify-center">
            <Button
              onClick={closeSuccessDialog}
              className="md:!w-fit !px-4 py-2"
              contentClassName="md:!px-8"
            >
              Done
            </Button>
          </div>
        </div>
      </Dialog>

      <DeleteModal
        isOpen={isOpened}
        onClose={closeDialog}
        title="Delete Account"
        messageSuffix="your account"
        onDelete={handleDeleteAccount}
        isDeleting={accountDeletionRequestIsPending}
      />

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
                  disabled={
                    !validity.valid || email.length === 0 || isEmailPending
                  }
                  type="submit"
                  onClick={handleEmailSubmit}
                  className="!w-fit"
                  uppercase={false}
                  contentClassName="!px-4 py-2"
                  size="small"
                >
                  {isEmailPending ? "Submitting" : "Submit"}
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
                      disabled={isNotificationPending}
                      checked={notifications[notification.key]}
                      handleSwitchChange={(e) => {
                        const updatedNotifications = {
                          ...notifications,
                          [notification.key]: e.target.checked,
                        };
                        setIsNotificationPending(true);
                        updateNotifications(
                          {
                            newsletter_subscription:
                              updatedNotifications.monthlyNewsletter,
                            notifications_delivery_methods: [
                              ...(updatedNotifications.emailTrainingNotification
                                ? ["email"]
                                : []),
                              ...(updatedNotifications.webTrainingNotification
                                ? ["web"]
                                : []),
                            ],
                          },
                          {
                            onSuccess: () => {
                              setNotifications(updatedNotifications);
                            },
                            onError: (error) => {
                              showErrorToast(
                                error,
                                "Error updating notifications",
                              );
                            },
                          },
                        );
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
                <p className="text-gray text-body-3">
                  {!user.account_deletion_requested
                    ? "If you no longer want to use fAIr, request to delete your account."
                    : "⚠️ Your request to delete your account is pending."}
                </p>
              </div>
              <ButtonWithIcon
                label="Delete My Account"
                variant="primary"
                prefixIcon={DeleteIcon}
                uppercase={false}
                className="!w-fit"
                textClassName="p-0.5 md:px-1 md:py-2 text-body-4"
                onClick={openDialog}
                size="small"
                disabled={user.account_deletion_requested}
              />
            </div>
          </div>
        </div>
      </div>
    </>
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
