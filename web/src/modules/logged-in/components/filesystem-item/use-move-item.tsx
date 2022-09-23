import { Button } from "@mantine/core";
import { showNotification, updateNotification } from "@mantine/notifications";
import { useMutation } from "react-query";
import { FilesystemItem } from "../../../../types";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../../utils/format-api-errors";
import { api, APIResponse } from "../../../api";
import { useAPICache } from "../../../shared-hooks/use-api-cache";
import { useFilesystem } from "../../context/filesystem-context";

export const useMoveItem = (item: FilesystemItem) => {
  const { currentRef } = useFilesystem();

  const apiCache = useAPICache();
  const moveItemMutation = useMutation<
    APIResponse,
    any,
    {
      name: string;
      parent: string | null;
    }
  >((values) => api(`/filesystem/${item.id}/move/`, "PATCH", values));

  const move_item_notif_id = `move_item_notif_id:${item.id}`;
  const moveItem = () => {
    updateNotification({
      id: move_item_notif_id,
      title: `Moving "${item.path}"...`,
      message: undefined,
      color: "gray",
      loading: true,
      autoClose: false,
    });

    moveItemMutation.mutate(
      {
        name: item.name,
        parent: currentRef?.current ? currentRef.current.id : null,
      },
      {
        onSuccess: (data) => {
          if (!data.ok) {
            apiErrorNotification(
              move_item_notif_id,
              // get the first error
              Object.values(formatApiErrors(data.data))[0]
            );
            return;
          }

          apiCache.updateItem(item.id, item.parent, data.data);

          updateNotification({
            id: move_item_notif_id,
            title: `"${item.name}" successfuly moved.`,
            message: `"${item.name}" moved to ${data.data.path}`,
            color: "blue",
          });
        },
        onError: (error) => {
          console.log(error);
          apiErrorNotification(move_item_notif_id);
        },
      }
    );
  };

  return () =>
    showNotification({
      id: move_item_notif_id,
      title: `Moving "${item.path}"...`,
      message: (
        <div>
          <span>
            Navigate to the folder you want to move "{item.name}" and click
          </span>
          <Button
            compact
            size="xs"
            variant="default"
            className="ml-2 my-1"
            onClick={moveItem}
          >
            Move
          </Button>
        </div>
      ),
      color: "gray",
      autoClose: false,
    });
};
