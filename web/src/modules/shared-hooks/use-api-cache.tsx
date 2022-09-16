import { useQueryClient } from "react-query";
import { FilesystemItem, FilesystemItemEditable } from "../../types";
import { APIResponse } from "../api";

export const useAPICache = () => {
  const queryClient = useQueryClient();

  const setAuthenticatedUserFromResponse = (response: APIResponse) => {
    const queryKey = ["auth/me"];
    queryClient.setQueryData<APIResponse>(queryKey, response);
  };

  const addItem = (item: FilesystemItem) => {
    const queryKey = ["filesystem", item.parent ? item.parent : null];
    const previousData = queryClient.getQueryData<APIResponse>(queryKey);

    if (previousData) {
      queryClient.setQueryData<APIResponse>(queryKey, {
        ...previousData,
        data: {
          ...previousData.data,
          items: [...previousData.data.items, item],
        },
      });
    }
  };

  const updateItem = (
    itemId: string,
    oldParent: string | null,
    itemValues: FilesystemItemEditable
  ) => {
    let oldItemAtOldParent: FilesystemItem | null = null;

    // if parent is changed, remove the item from its old position
    if (oldParent !== itemValues.parent) {
      const oldParentQueryKey = ["filesystem", oldParent];
      const oldParentQueryData =
        queryClient.getQueryData<APIResponse>(oldParentQueryKey);

      if (oldParentQueryData) {
        const oldItems = oldParentQueryData.data.items as FilesystemItem[];
        oldItemAtOldParent = oldItems.find((i) => i.id === itemId) || null;

        const updatedItems = oldItems.filter((item) => item.id !== itemId);

        queryClient.setQueryData<APIResponse>(oldParentQueryKey, {
          ...oldParentQueryData,
          data: {
            ...oldParentQueryData.data,
            items: updatedItems,
          },
        });
      }
    }

    const newParentQueryKey = ["filesystem", itemValues.parent];
    const newParentQueryData =
      queryClient.getQueryData<APIResponse>(newParentQueryKey);

    if (newParentQueryData) {
      const oldItems = newParentQueryData.data.items as FilesystemItem[];
      const updatedItems = oldItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            ...itemValues,
          };
        } else {
          return item;
        }
      });

      // if this is not null, that means the parent is changed.
      // in this case, add it to its new parent.
      if (oldItemAtOldParent) {
        updatedItems.push({
          ...oldItemAtOldParent,
          ...itemValues,
        });
      }

      queryClient.setQueryData<APIResponse>(newParentQueryKey, {
        ...newParentQueryData,
        data: {
          ...newParentQueryData.data,
          items: updatedItems,
        },
      });
    }

    const queryKey = ["filesystem", itemId];
    const queryData = queryClient.getQueryData<APIResponse>(queryKey);

    if (queryData) {
      const oldItem = queryData.data.current as FilesystemItem;
      queryClient.setQueryData<APIResponse>(queryKey, {
        ...queryData,
        data: {
          ...queryData.data,
          current: {
            ...oldItem,
            ...itemValues,
          },
        },
      });
    }
  };

  const removeItem = (item: FilesystemItem) => {
    const parentQueryKey = ["filesystem", item.parent ? item.parent : null];
    const parentQueryData =
      queryClient.getQueryData<APIResponse>(parentQueryKey);

    if (parentQueryData) {
      const oldItems = parentQueryData.data.items as FilesystemItem[];
      const newItems = oldItems.filter((_item) => _item.id !== item.id);

      queryClient.setQueryData<APIResponse>(parentQueryKey, {
        ...parentQueryData,
        data: {
          ...parentQueryData.data,
          items: newItems,
        },
      });
    }

    queryClient.removeQueries(["filesystem", item.id]);
  };

  return {
    setAuthenticatedUserFromResponse,
    addItem,
    updateItem,
    removeItem,
  };
};
