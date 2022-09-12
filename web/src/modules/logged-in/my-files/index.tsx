import { ActionIcon, Button } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { BsFolderPlus } from "react-icons/bs";
import { IoMdArrowBack } from "react-icons/io";
import { FilesystemItem } from "../../../types";
import { apiErrorNotification } from "../../../utils/api-error-update-notification";
import { api } from "../../api";
import { useAuth } from "../../auth-context";
import { FilesystemItemComponent } from "../components/filesystem-item";
import { Layout } from "../layout";
import { CreateFolderModal } from "./create-folder-modal";
import { UploadFileModal } from "./upload-file-modal";

export const MyFilesPage: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<FilesystemItem | null>(null);
  const [items, setItems] = useState<FilesystemItem[]>([]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);

  useEffect(() => {
    let url = "/filesystem/";
    if (currentItem) {
      url += currentItem.id + "/";
    }

    api(url)
      .then((response) => {
        if (response.ok) {
          setItems(response.data.items);
        }
      })
      .catch((error) => {
        console.log(error);
        apiErrorNotification();
      });
  }, [currentItem]);

  const { user } = useAuth();
  if (!user) return null;

  const onItemClicked = async (item: FilesystemItem) => {
    if (item.is_file) {
      // apiDownloadFile(item);
    } else {
      setCurrentItem(item);
    }
  };

  const goBack = () => {
    if (!currentItem) return;
    setCurrentItem((i) => (i ? i.parent : null));
  };

  return (
    <Layout>
      <>
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col h-full">
            <div className="flex flex-row justify-between items-center px-4 py-2 border-solid border-0 border-b-2 border-b-gray-200 bg-gray-100 text-gray-600">
              <div className="flex items-center space-x-4">
                <IoMdArrowBack
                  size={20}
                  className={`${
                    currentItem
                      ? "text-gray-600 cursor-pointer"
                      : "text-gray-300"
                  }`}
                  onClick={goBack}
                />
                <div>
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
                <ActionIcon
                  color="red"
                  variant="subtle"
                  title="Create folder"
                  onClick={() => setCreateFolderModalOpen(true)}
                >
                  <BsFolderPlus size={18} />
                </ActionIcon>
              </div>
            </div>
            <div className="flex flex-col h-full">
              {items.length <= 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <img
                    alt="empty gif"
                    src="https://media3.giphy.com/media/giXLnhxp60zEEIkq8K/giphy.gif?cid=ecf05e474q6i7r8wsfv0udn2soyd7rjjz0j83t7wizn6gtca&rid=giphy.gif&ct=g"
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
          <div className="flex flex-row items-center bg-orange-200 text-orange-500 px-4 py-3">
            <Button
              compact
              color="dark"
              leftIcon={<AiOutlineCloudUpload />}
              onClick={() => setUploadModalOpen(true)}
            >
              <span className="font-bold">Upload</span>
            </Button>
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
