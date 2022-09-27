import { ActionIcon, LoadingOverlay, Menu } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import prettyBytes from "pretty-bytes";
import React, { useEffect, useState } from "react";
import { AiOutlineCloudUpload, AiOutlinePlus } from "react-icons/ai";
import { BsFolderPlus } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { FilesystemItem } from "../../../types";
import { api } from "../../api";
import { useAuth } from "../../auth-context";
import { FilesystemItemComponent } from "../components/filesystem-item";
import { useFilesystem } from "../context/filesystem-context";
import { Layout } from "../layout";
import { CreateFolderModal } from "./create-folder-modal";
import { UploadFileModal } from "./upload-file-modal";

export const MyFilesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const filesystem = useFilesystem();

  const [currentItemId, setCurrentItemId] =
    useState<FilesystemItem["parent"]>(null);
  const [currentItem, setCurrentItem] = useState<FilesystemItem | null>(null);
  const [items, setItems] = useState<FilesystemItem[]>([]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  const [itemsQueryEnabled, setItemsQueryEnabled] = useState(false);
  const itemsQuery = useQuery(
    ["filesystem", currentItemId ? currentItemId : null],
    () => {
      return api(`/filesystem/${currentItemId ? currentItemId + "/" : ""}`);
    },
    {
      enabled: itemsQueryEnabled,
    }
  );

  useEffect(
    () => {
      let currentPath = location.pathname.slice(2);
      if (currentPath === "/") {
        setItemsQueryEnabled(true);
        return;
      }

      currentPath = decodeURIComponent(currentPath);
      const encodedCurrentPath = encodeURIComponent(
        encodeURIComponent(currentPath)
      );

      const displayErrorNotification = () => {
        showNotification({
          id: "path_couldnt_found_notif_id",
          title: `Couldn't find "${currentPath}"`,
          message: `"${currentPath}" doesn't seem to be in your files.`,
          color: "red",
        });
      };

      api(`/filesystem/path/${encodedCurrentPath}/`)
        .then((response) => {
          if (response.ok) {
            setCurrentItemId(response.data.item?.id || null);
          } else {
            displayErrorNotification();
          }

          setItemsQueryEnabled(true);
        })
        .catch(() => {
          displayErrorNotification();
        });
    },
    // eslint-disable-next-line
    []
  );

  useEffect(() => {
    if (itemsQuery.isSuccess && itemsQuery.data?.data) {
      setCurrentItem(itemsQuery.data.data.current);
      setItems(itemsQuery.data.data.items);
    }
  }, [itemsQuery]);

  useEffect(
    () => {
      filesystem.setCurrent(currentItem);
      navigate(`/-${currentItem ? currentItem.path : "/"}`, {
        state: {
          currentItemId: currentItem ? currentItem.id : null,
        },
      });
    },
    // eslint-disable-next-line
    [currentItem]
  );

  useEffect(() => {
    const itemId = location.state?.currentItemId;
    if (typeof itemId === "string" || itemId == null) {
      setCurrentItemId(itemId);
    }
  }, [location.state]);

  const { user } = useAuth();
  if (!user) return null;

  const onItemClicked = async (item: FilesystemItem) => {
    if (!item.is_file) {
      setCurrentItemId(item.id);
    }
  };

  const goBack = () => {
    if (!currentItem) return;
    setCurrentItemId(currentItem.parent);
  };

  const getTotalSizeOfCurrentDir = () => {
    let size: number = 0;
    items.forEach((item) => (size += item.size));
    return size;
  };

  return (
    <Layout>
      <>
        <div className="flex flex-col h-full bg-gray-100">
          <div className="flex-1 flex flex-col h-full relative">
            <div className="flex flex-row justify-between items-center px-4 py-2 border-solid border-0 border-b-2 border-b-gray-200 bg-gray-100 text-gray-600">
              <div
                className="flex items-center space-x-4"
                style={{
                  maxWidth: "calc(100% - 40px)",
                }}
              >
                <IoMdArrowBack
                  size={20}
                  className={`${
                    currentItem
                      ? "text-gray-600 cursor-pointer"
                      : "text-gray-300"
                  }`}
                  onClick={goBack}
                />
                <div className="overflow-x-auto whitespace-nowrap no-scrollbar">
                  {(currentItem ? currentItem.path + "/" : "/")
                    .slice(1)
                    .split("/")
                    .map((e) => {
                      return (
                        <span key={e}>
                          <span className="font-bold mx-1 cursor-default">
                            /
                          </span>
                          <span className="cursor-pointer hover:underline">
                            {e}
                          </span>
                        </span>
                      );
                    })}
                </div>
              </div>
              <div>
                <Menu width={180} position="bottom-end" withArrow offset={0}>
                  <Menu.Target>
                    <ActionIcon
                      className="cursor-pointer text-orange-400 hover:text-orange-500"
                      variant="subtle"
                    >
                      <AiOutlinePlus size={20} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      icon={<AiOutlineCloudUpload size={16} />}
                      onClick={() => setUploadModalOpen(true)}
                    >
                      Upload file
                    </Menu.Item>
                    <Menu.Item
                      icon={<BsFolderPlus size={14} />}
                      onClick={() => setCreateFolderModalOpen(true)}
                    >
                      Create folder
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </div>
            <div className="flex flex-col h-full overflow-y-auto relative">
              <LoadingOverlay visible={itemsQuery.isLoading} overlayBlur={2} />
              {items.length <= 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <img
                    alt="empty gif"
                    src="/images/empty.gif"
                    width={300}
                    className="mb-4 select-none"
                  />
                  <div className="text-gray-400 text-md font-medium italic">
                    “This folder is pretty empty.“
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <FilesystemItemComponent
                    key={item.id}
                    item={item}
                    onClick={() => onItemClicked(item)}
                  />
                ))
              )}
            </div>
          </div>
          {/* footer */}
          <div className="fixed z-10 bottom-0 w-full flex flex-row items-center bg-orange-200 text-orange-500 px-4 py-3">
            <div className="font-semibold">
              Folder size:{" "}
              <span className="font-bold text-orange-600">
                {items.length > 0
                  ? prettyBytes(getTotalSizeOfCurrentDir())
                  : "Zero"}
              </span>
            </div>
          </div>
        </div>
        <UploadFileModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
        />
        <CreateFolderModal
          isOpen={createFolderModalOpen}
          onClose={() => setCreateFolderModalOpen(false)}
        />
      </>
    </Layout>
  );
};
