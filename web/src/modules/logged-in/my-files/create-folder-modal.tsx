import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { BsFolderPlus } from "react-icons/bs";
import { apiErrorNotification } from "../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../utils/format-api-errors";
import { api } from "../../api";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (value) => (value.length <= 0 ? "This field is required." : null),
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // reset state on open
    if (isOpen) {
      setLoading(false);
      form.reset();
    }
  }, [isOpen, form]);

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
          setLoading(true);

          api("/filesystem/create", "POST", {
            parent: null,
            name: values.name,
            uploaded_file: null,
          })
            .then((response) => {
              setLoading(false);

              if (!response.ok) {
                form.setErrors(formatApiErrors(response.data));
                return;
              }

              onClose();

              showNotification({
                title: "Folder created",
                message: `Folder "${values.name}" created successfuly!`,
                color: "blue",
              });
            })
            .catch((error) => {
              console.log(error);
              apiErrorNotification();
            });
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
            loading={loading}
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
