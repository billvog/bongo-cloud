import { updateNotification } from "@mantine/notifications";

export const apiErrorUpdateNotification = (
  notification_id: string,
  message: string = "We're sorry to inform you that something went wrong."
) => {
  updateNotification({
    id: notification_id,
    title: "Something went wrong 😥",
    message: message,
    color: "red",
    loading: false,
  });
};
