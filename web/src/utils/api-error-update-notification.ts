import { updateNotification } from "@mantine/notifications";

export const apiErrorUpdateNotification = (notification_id: string) => {
  updateNotification({
    id: notification_id,
    title: "Something went wrong 😥",
    message: "We're sorry to inform you that something went wrong.",
    color: "red",
    loading: false,
  });
};
