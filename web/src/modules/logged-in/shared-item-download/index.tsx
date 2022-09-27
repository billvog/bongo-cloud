import { Button, Loader, PasswordInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { AiOutlineDownload } from "react-icons/ai";
import { IoMdLock } from "react-icons/io";
import { MdKeyboardBackspace } from "react-icons/md";
import { useQuery } from "react-query";
import { Link, useParams } from "react-router-dom";
import { FilesystemSharedItem } from "../../../types";
import { api } from "../../api";
import { useAuth } from "../../auth-context";
import { useDownloadItem } from "../components/filesystem-item/use-download-item";
import { UserAvatar } from "../components/user-avatar";

export const SharedItemDownloadPage: React.FC = () => {
  const { shareId } = useParams();
  const { user } = useAuth();

  const downloadItem = useDownloadItem();

  const [password, setPassword] = useState<string>("");

  const [sharedItem, setSharedItem] = useState<FilesystemSharedItem | null>(
    null
  );

  const sharedItemQuery = useQuery(["share", shareId, "download"], () => {
    return api(`/filesystem/share/${shareId}/`);
  });

  useEffect(() => {
    if (sharedItemQuery.data?.ok && sharedItemQuery.data.data) {
      setSharedItem(sharedItemQuery.data.data);
    }
  }, [sharedItemQuery]);

  const onDownloadClicked = () => {
    if (!sharedItem) {
      return;
    }

    if (sharedItem.has_password && password.length <= 0) {
      showNotification({
        title: "Password is required.",
        message: "Please provide a valid password.",
        color: "red",
      });

      return;
    }

    downloadItem(sharedItem.item, sharedItem.download_url, "POST", {
      password,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="clouded-bg-container">
      {sharedItemQuery.isLoading ? (
        <Loader color="dark" variant="bars" />
      ) : sharedItemQuery.isError || !sharedItem ? (
        <div className="text-red-600">
          <h1>Something went wrong.</h1>
          <p className="font-semibold">
            Something went wrong trying to find the requested file.
          </p>
        </div>
      ) : (
        <div
          className="bg-white bg-opacity-30 w-full max-w-xl min-h-full h-fit px-8 py-10 space-y-6 overflow-y-auto"
          style={{
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <Link to="/-/" className="flex flex-row items-center w-fit">
            <MdKeyboardBackspace />
            <span className="ml-2 font-bold">Return to your files.</span>
          </Link>
          <h2>Download "{sharedItem.item.name}"</h2>
          <div>
            <div className="mb-1 font-semibold">Shared from:</div>
            <div className="flex flex-row items-center p-4 space-x-4 border-solid border-2 border-orange-200 bg-orange-50 rounded-lg">
              <UserAvatar user={sharedItem.sharer} />
              <div className="flex flex-col">
                <div className="text-md leading-tight">
                  {sharedItem.sharer.first_name} {sharedItem.sharer.last_name}
                </div>
                <div className="leading-tight text-sm">
                  @
                  <span className="font-bold">
                    {sharedItem.sharer.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {sharedItem.does_expire && sharedItem.expiry && (
            <div className="space-y-1.5">
              <p>
                This link expires in{" "}
                <b>{dayjs(sharedItem.expiry).toNow(true)}</b>.
              </p>
              <p className="text-xs">
                At <b>{dayjs(sharedItem.expiry).format("DD/MM/YYYY, HH:mm")}</b>
                .
              </p>
            </div>
          )}
          {sharedItem.has_password && (
            <div>
              <div className="font-bold flex items-center space-x-2 mb-2">
                <IoMdLock size={18} />
                <span>This file is protected with a password.</span>
              </div>
              <PasswordInput
                label="Password"
                placeholder="Enter the password to download this file"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") onDownloadClicked();
                }}
              />
            </div>
          )}
          <Button leftIcon={<AiOutlineDownload />} onClick={onDownloadClicked}>
            Download
          </Button>
        </div>
      )}
    </div>
  );
};
