import {
  Button,
  Checkbox,
  Modal,
  MultiSelect,
  PasswordInput,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import React, { useEffect, useState } from "react";
import { BiTime } from "react-icons/bi";
import { BsCalendarDate } from "react-icons/bs";
import { IoMdLock } from "react-icons/io";
import { useMutation, useQuery } from "react-query";
import { FilesystemItem, FilesystemSharedItem } from "../../../../types";
import { apiErrorNotification } from "../../../../utils/api-error-update-notification";
import { formatApiErrors } from "../../../../utils/format-api-errors";
import { api, APIResponse } from "../../../api";
import { MyFieldset } from "../my-fieldset";

const generateShareLink = (shareId: string) => {
  return `${process.env.REACT_APP_URL}/share/${shareId}/download`;
};

interface ShareItemModalProps {
  item: FilesystemItem;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareItemModal: React.FC<ShareItemModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const clipboard = useClipboard({ timeout: 500 });

  const [isUpdating] = useState(item.is_shared);
  const [sharedItem, setSharedItem] = useState<FilesystemSharedItem | null>(
    null
  );

  const [allowedUsersData, setAllowedUsersData] = useState<string[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [expires, setExpires] = useState(false);

  const form = useForm({
    initialValues: {
      allowed_users: [] as string[],
      password: "",
      expiry_date: new Date(),
      expiry_time: new Date("0"),
    },
    validate: {
      password: (password: string) => {
        if (hasPassword) {
          if (isUpdating && sharedItem && sharedItem.has_password) {
            return null;
          }

          if (password.length <= 0) {
            return "Please enter a password.";
          }
        }
        return null;
      },
    },
  });

  const sharedItemQuery = useQuery(
    ["share", "item", item.id],
    () => {
      return api(`/filesystem/share/item/${item.id}/`);
    },
    { enabled: isUpdating }
  );

  useEffect(
    () => {
      if (sharedItemQuery.data && sharedItemQuery.data.ok) {
        const data = sharedItemQuery.data.data;
        setSharedItem(data);

        setAllowedUsersData(data.allowed_users);
        form.setFieldValue("allowed_users", data.allowed_users);

        setHasPassword(data.has_password);

        setExpires(data.does_expire);
        if (data.expiry) {
          const expiry = new Date(data.expiry);
          form.setFieldValue("expiry_date", expiry);
          form.setFieldValue("expiry_time", expiry);
        }
      }
    },
    // eslint-disable-next-line
    [sharedItemQuery.data]
  );

  const shareItemMutation = useMutation<
    APIResponse,
    any,
    {
      allowed_users: string[];
      password: string | null;
      expiry: Date | null;
    }
  >((values) => {
    if (isUpdating && sharedItem) {
      return api(`/filesystem/share/${sharedItem.id}/update/`, "PATCH", values);
    } else {
      return api(`/filesystem/${item.id}/share/`, "POST", values);
    }
  });

  const deleteItemMutation = useMutation<APIResponse>(() =>
    api(`/filesystem/share/${sharedItem!.id}/delete/`, "DELETE")
  );

  const onDeleteClicked = () => {
    if (sharedItem) {
      deleteItemMutation.mutate(undefined, {
        onSuccess: (data) => {
          if (!data.ok) {
            apiErrorNotification();
            return;
          }

          onClose();
          showNotification({
            title: "Share deleted!",
            message: `"${item.name}" is not shared anymore.`,
          });
        },
        onError: () => {
          apiErrorNotification();
        },
      });
    }
  };

  const onCopyLinkClicked = () => {
    if (!sharedItem) {
      return;
    }

    const shareLink = generateShareLink(sharedItem.id);
    clipboard.copy(shareLink);

    showNotification({
      message: `The share link is copied to your clipboard.`,
      color: "blue",
    });
  };

  const validateUserShortCode = (short_code: string) => {
    return short_code.length === 6 && short_code.match(/^[a-zA-Z0-9]+$/);
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.5}
      title={<span className="font-bold text-lg">Share "{item.name}"</span>}
    >
      <form
        className="flex flex-col"
        onSubmit={form.onSubmit((values) => {
          var password: string | null = values.password;
          if (!hasPassword) {
            password = null;
          }

          var expiry: Date | null = null;
          if (expires) {
            const expiry_date = values.expiry_date;
            const expiry_time = values.expiry_time;

            expiry = expiry_date;
            expiry.setHours(
              expiry_time.getHours(),
              expiry_time.getMinutes(),
              expiry_time.getSeconds()
            );

            if (
              new Date().setHours(0, 0, 0, 0) >
              new Date(expiry_date).setHours(0, 0, 0, 0)
            ) {
              form.setFieldError("expiry_date", "Selected date has passed.");
              return;
            } else if (new Date() > expiry) {
              form.setFieldError("expiry_time", "Selected time has passed.");
              return;
            }
          }

          shareItemMutation.mutate(
            {
              allowed_users: values.allowed_users,
              password: password,
              expiry: expiry,
            },
            {
              onSuccess: (data) => {
                if (!data.ok) {
                  if (data.data.detail) {
                    apiErrorNotification(undefined, data.data.detail);
                  } else {
                    try {
                      form.setErrors(formatApiErrors(data.data));
                    } catch {
                      apiErrorNotification();
                    }
                  }

                  return;
                }

                const sharedLink = generateShareLink(data.data.id);
                clipboard.copy(sharedLink);

                onClose();

                showNotification({
                  title: isUpdating
                    ? `"${item.name}" share is updated!`
                    : `"${item.name}" is now shared!`,
                  message: `The share link is copied to your clipboard.`,
                  color: "blue",
                });
              },
              onError: () => {
                apiErrorNotification();
              },
            }
          );
        })}
      >
        <div className="space-y-8 mb-6">
          <MultiSelect
            {...form.getInputProps("allowed_users")}
            label="Allowed users"
            placeholder="Leave empty to allow anyone."
            description="Select the users you want to have access to this file providing their short codes."
            data={allowedUsersData}
            searchable
            creatable
            getCreateLabel={(query) =>
              validateUserShortCode(query) ? (
                <span>
                  Add #<b>{query}</b> to allowed users.
                </span>
              ) : (
                <span className="text-red-600">
                  #<b>{query}</b> is not a valid user code.
                </span>
              )
            }
            onCreate={(query) => {
              const item = query;
              if (!validateUserShortCode(item)) {
                showNotification({
                  title: (
                    <span>
                      #<b>{item}</b> is not a valid user code.
                    </span>
                  ),
                  message: "Make sure the provided user code is valid.",
                  color: "red",
                });
                return null;
              }

              setAllowedUsersData((current) => [...current, item]);
              return item;
            }}
          />
          <MyFieldset
            hero={
              <Checkbox
                label="Secure with password"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.currentTarget.checked)}
                radius="xl"
                size="sm"
              />
            }
            content={
              hasPassword ? (
                <div>
                  <PasswordInput
                    {...form.getInputProps("password")}
                    label="Password"
                    placeholder="Password"
                    description="The shared file will be downloadable only if the correct password is given."
                    icon={<IoMdLock />}
                  />
                  {isUpdating && (
                    <p className="mt-4 text-xs text-gray-500 font-medium">
                      Enter a password if you want to update the current or
                      leave empty to use the same.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-600 font-medium">
                  Anyone with the link will be able to download this file.
                </div>
              )
            }
          />
          <MyFieldset
            hero={
              <Checkbox
                label="Expire"
                checked={expires}
                onChange={(e) => setExpires(e.currentTarget.checked)}
                radius="xl"
                size="sm"
              />
            }
            content={
              expires ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Select a date and time, beyond which the file won't be
                    downloadable.
                  </p>
                  <DatePicker
                    {...form.getInputProps("expiry_date")}
                    label="Pick the year, month, day"
                    minDate={new Date()}
                    clearable={false}
                    icon={<BsCalendarDate />}
                  />
                  <TimeInput
                    {...form.getInputProps("expiry_time")}
                    label="Pick the hour, minute, seconds"
                    withSeconds
                    amLabel="am"
                    pmLabel="pm"
                    icon={<BiTime />}
                  />
                </div>
              ) : (
                <div className="text-xs text-gray-600 font-medium">
                  The link will never expire.
                </div>
              )
            }
          />
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="space-x-3">
            {isUpdating && (
              <>
                <Button
                  compact
                  variant="filled"
                  color="red"
                  type="button"
                  onClick={onDeleteClicked}
                  loading={deleteItemMutation.isLoading}
                >
                  Delete
                </Button>
                <Button
                  compact
                  variant="light"
                  type="button"
                  onClick={onCopyLinkClicked}
                >
                  Copy link
                </Button>
              </>
            )}
          </div>
          <div className="space-x-3">
            <Button
              compact
              color="dark"
              type="submit"
              loading={shareItemMutation.isLoading}
            >
              {isUpdating ? "Update" : "Share"}
            </Button>
            <Button compact variant="default" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
