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

    console.log(queryKey);
    console.log(previousData);

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
    const parentQueryKey = ["filesystem", oldParent ? oldParent : null];
    const parentQueryData =
      queryClient.getQueryData<APIResponse>(parentQueryKey);

    if (parentQueryData) {
      const oldItems = parentQueryData.data.items as FilesystemItem[];
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

      queryClient.setQueryData<APIResponse>(parentQueryKey, {
        ...parentQueryData,
        data: {
          ...parentQueryData.data,
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
