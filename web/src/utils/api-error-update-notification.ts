import {
  NotificationProps,
  showNotification,
  updateNotification,
} from "@mantine/notifications";

export const apiErrorNotification = (
  notification_id: string | undefined = undefined,
  message: string = "We're sorry to inform you that something went wrong."
) => {
  const options: NotificationProps = {
    title: "Something went wrong 😥",
    message: message,
    color: "red",
    loading: false,
  };

  if (notification_id) {
    updateNotification({
      id: notification_id,
      ...options,
    });
  } else {
    showNotification(options);
  }
};
