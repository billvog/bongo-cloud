import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import React, { useEffect } from "react";
import { BsFolderPlus } from "react-icons/bs";
import { useMutation } from "react-query";
import { apiErrorNotification } from "../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../utils/format-api-errors";
import { api, APIResponse } from "../../api";
import { useAPICache } from "../../shared-hooks/use-api-cache";
import { useFilesystem } from "../context/filesystem-context";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const filesystem = useFilesystem();

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.length <= 0 ? "This field is required." : null),
    },
  });

  const apiCache = useAPICache();
  const createFolderMutation = useMutation<
    APIResponse,
    any,
    { parent: string | null; name: string }
  >((values) => {
    return api("/filesystem/create/", "POST", {
      parent: values.parent,
      name: values.name,
      uploaded_file: null,
    });
  });

  useEffect(() => {
    // reset state on open
    if (isOpen) {
      createFolderMutation.reset();
      form.reset();
    }
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.5}
      title={<span className="font-bold text-lg">Create folder</span>}
    >
      <form
        className="flex flex-col space-y-5"
        onSubmit={form.onSubmit((values) => {
          createFolderMutation.mutate(
            {
              parent: filesystem.current?.id || null,
              name: values.name,
            },
            {
              onSuccess: (data) => {
                if (!data.ok) {
                  form.setErrors(formatApiErrors(data.data));
                  return;
                }

                apiCache.addItem(data.data);

                onClose();
                showNotification({
                  title: "Folder created",
                  message: `Folder "${values.name}" created successfuly!`,
                  color: "blue",
                });
              },
              onError: (error) => {
                console.log(error);
                apiErrorNotification();
              },
            }
          );
        })}
      >
        <div className="relative">
          <TextInput
            placeholder="ex. My folder"
            label="Folder name"
            variant="filled"
            {...form.getInputProps("name")}
          />
        </div>
        <div className="flex flex-row items-center justify-end space-x-3">
          <Button
            compact
            color="dark"
            type="submit"
            leftIcon={<BsFolderPlus />}
            loading={createFolderMutation.isLoading}
          >
            Create
          </Button>
          <Button compact variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
