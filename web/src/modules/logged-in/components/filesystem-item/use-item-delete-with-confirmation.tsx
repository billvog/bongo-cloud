import { openConfirmModal } from "@mantine/modals";
import { showNotification, updateNotification } from "@mantine/notifications";
import { IoTrash } from "react-icons/io5";
import { useMutation } from "react-query";
import { FilesystemItem } from "../../../../types";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { api, APIResponse } from "../../../api";
import { useAPICache } from "../../../shared-hooks/use-api-cache";

export const useItemDeleteWithConfirmation = (item: FilesystemItem) => {
  const apiCache = useAPICache();
  const deleteItemMutation = useMutation<APIResponse>(() =>
    api(`/filesystem/${item.id}/delete`, "DELETE")
  );

  const deleteFile = () => {
    const delete_file_notif_id = "delete_file_notif_id";
    showNotification({
      id: delete_file_notif_id,
      title: `Deleting "${item.name}"...`,
      message: undefined,
      color: "gray",
      loading: true,
    });

    deleteItemMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (!data.ok) {
          updateNotification({
            id: delete_file_notif_id,
            title: `Couldn't delete "${item.name}".`,
            message: `Something went wrong while trying to delete "${item.name}"`,
            color: "red",
            loading: false,
          });
          return;
        }

        apiCache.removeItem(item);

        updateNotification({
          id: delete_file_notif_id,
          title: `"${item.name}" deleted.`,
          message: "Item deleted successfully!",
          color: "blue",
          loading: false,
        });
      },
      onError: (error) => {
        console.log(error);
        apiErrorNotification(delete_file_notif_id);
      },
    });
  };

  return () => {
    openConfirmModal({
      centered: true,
      overlayBlur: 3,
      overlayOpacity: 0.5,
      title: <span className="font-bold text-lg">Delete confirmation.</span>,
      children: (
        <div>
          <p>
            Are you sure you want to delete "
            <span className="font-semibold underline">{item.name}</span>
            "?
          </p>
        </div>
      ),
      confirmProps: {
        color: "red",
        variant: "light",
        leftIcon: <IoTrash size={16} />,
      },
      cancelProps: {
        variant: "default",
      },
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onConfirm: () => deleteFile(),
    });
  };
};
