import { RingProgress, ThemeIcon } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { AiFillCheckCircle } from "react-icons/ai";
import { FilesystemItem } from "../../../../types";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { apiDownloadFile } from "../../../api";

export const useDownloadItem = () => {
  return (item: FilesystemItem, ...args: any) => {
    const download_loading_notif_id = "download_loading_notif_id:" + item.id;

    const RingProgressComponent = (progress: number) => {
      return (
        <RingProgress
          sections={[{ value: progress, color: "blue" }]}
          size={40}
        />
      );
    };

    showNotification({
      id: download_loading_notif_id,
      title: "Downloading...",
      message: `Download is starting...`,
      icon: RingProgressComponent(0),
      disallowClose: true,
    });

    apiDownloadFile(
      item,
      (xhr, total, recieved) => {
        updateNotification({
          id: download_loading_notif_id,
          title: "Downloading...",
          message: `"${item.name}" is downloading...`,
          icon: RingProgressComponent((recieved / total) * 100),
          autoClose: false,
          onClose: () => {
            xhr.abort();
          },
        });
      },
      ...args
    )
      .then((data) => {
        if (!data.ok) {
          if (data.data?.detail) {
            apiErrorNotification(download_loading_notif_id, data.data.detail);
          } else {
            apiErrorNotification(download_loading_notif_id);
          }
          return;
        }

        updateNotification({
          id: download_loading_notif_id,
          title: "Success",
          message: `"${item.name}" is downloaded!`,
          icon: (
            <ThemeIcon color="teal" variant="light" radius="xl" size="md">
              <AiFillCheckCircle size={22} />
            </ThemeIcon>
          ),
        });
      })
      .catch(() => {
        apiErrorNotification(download_loading_notif_id);
      });
  };
};
