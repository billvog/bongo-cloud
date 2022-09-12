import { Button, Modal, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { FilesystemItem } from "../../../../types";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../../utils/format-api-errors";
import { api } from "../../../api";

interface RenameItemModalProps {
  item: FilesystemItem;
  isOpen: boolean;
  onClose: () => void;
}

export const RenameItemModal: React.FC<RenameItemModalProps> = ({
  item,
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

  useEffect(
    () => {
      // reset state on open
      if (isOpen) {
        setLoading(false);
        form.reset();
        form.setFieldValue("name", item.name);
      }
    },
    // eslint-disable-next-line
    [isOpen]
  );

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.5}
      title={<span className="font-bold text-lg">Rename "{item.name}"</span>}
    >
      <form
        className="flex flex-col space-y-5"
        onSubmit={form.onSubmit((values) => {
          setLoading(true);

          api(`/filesystem/${item.id}/update`, "PATCH", {
            parent: null,
            name: values.name,
          })
            .then((response) => {
              setLoading(false);

              if (!response.ok) {
                form.setErrors(formatApiErrors(response.data));
                return;
              }

              onClose();

              showNotification({
                title: "Item renamed",
                message: `"${item.name}" renamed to "${response.data.name}".`,
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
            placeholder="ex. my-image.jpeg"
            label="New name"
            variant="filled"
            {...form.getInputProps("name")}
          />
        </div>
        <div className="flex flex-row items-center justify-end space-x-3">
          <Button compact color="dark" type="submit" loading={loading}>
            Rename
          </Button>
          <Button compact variant="default" type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};
