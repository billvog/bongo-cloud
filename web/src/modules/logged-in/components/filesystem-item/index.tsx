import { ActionIcon, Menu } from "@mantine/core";
import prettyBytes from "pretty-bytes";
import React, { useState } from "react";
import {
  AiFillFolder,
  AiOutlineDownload,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { BiMove, BiRename } from "react-icons/bi";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { IoShareOutline, IoTrash } from "react-icons/io5";
import { VscOpenPreview } from "react-icons/vsc";
import { FilesystemItem } from "../../../../types";
import { getIconForFile } from "../../../../utils/get-icon-for-file";
import { getItemPreviewableKind } from "../../../../utils/previewable-item";
import { PreviewModal } from "./preview-modal";
import { RenameItemModal } from "./rename-item-modal";
import { ShareItemModal } from "./share-item-modal";
import { useDownloadItem } from "./use-download-item";
import { useItemDeleteWithConfirmation } from "./use-item-delete-with-confirmation";
import { useMoveItem } from "./use-move-item";

interface FilesystemItemProps {
  item: FilesystemItem;
  onClick: () => any;
}

export const FilesystemItemComponent: React.FC<FilesystemItemProps> = ({
  item,
  onClick,
}) => {
  const moveItem = useMoveItem(item);
  const deleteItem = useItemDeleteWithConfirmation(item);
  const downloadItem = useDownloadItem();
  const [previewModalOpen, setPreviewModelOpen] = useState(false);
  const [shareModalOpen, setShareModelOpen] = useState(false);
  const [renameModalOpen, setRenameModelOpen] = useState(false);

  const onDeleteClicked = () => deleteItem();
  const onMoveClicked = () => moveItem();
  const onDownloadClicked = () => downloadItem(item);
  const onPreviewClicked = () => setPreviewModelOpen(true);
  const onShareClicked = () => setShareModelOpen(true);
  const onRenameClicked = () => setRenameModelOpen(true);

  const ItemIcon = item.is_file ? getIconForFile(item.name) : AiFillFolder;

  return (
    <>
      <div className="flex flex-row items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 border-solid border-0 border-b border-b-gray-200">
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mr-2 sm:w-[calc(100%-26px+8px)] w-3/4">
          <div
            onClick={onClick}
            className={`flex items-center space-x-2 w-full sm:w-auto text-gray-500 hover:text-gray-700 cursor-pointer ${
              item.is_file ? "font-medium" : "font-bold"
            }`}
          >
            <ItemIcon />
            <div className="truncate">{item.name}</div>
          </div>
          <div className="text-xs md:text-sm ml-6 sm:ml-0 font-bold text-gray-600">
            {prettyBytes(item.size)}
          </div>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <div>
            <Menu position="left" withArrow>
              <Menu.Target>
                <ActionIcon
                  className="cursor-pointer text-orange-300 hover:text-orange-500"
                  variant="transparent"
                >
                  <HiOutlineDotsCircleHorizontal size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label className="text-gray-500 font-bold min-w-[180px] max-w-[50vmin] truncate">
                  {item.name}
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  disabled={!getItemPreviewableKind(item)}
                  icon={<VscOpenPreview size={16} />}
                  onClick={onPreviewClicked}
                >
                  Preview
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  disabled={!item.is_file}
                  icon={<AiOutlineDownload size={16} />}
                  onClick={onDownloadClicked}
                >
                  Download
                </Menu.Item>
                <Menu.Item
                  disabled={!item.is_file}
                  icon={<IoShareOutline size={16} />}
                  onClick={onShareClicked}
                  title={
                    item.is_file ? "Folders can't be shared yet" : undefined
                  }
                >
                  Share
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  icon={<IoTrash size={16} />}
                  onClick={onDeleteClicked}
                >
                  Delete...
                </Menu.Item>
                <Menu.Item
                  icon={<BiRename size={16} />}
                  onClick={onRenameClicked}
                >
                  Rename
                </Menu.Item>
                <Menu.Item icon={<BiMove size={16} />} onClick={onMoveClicked}>
                  Move
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  disabled={true}
                  icon={<AiOutlineInfoCircle size={16} />}
                >
                  Info
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
      {previewModalOpen && (
        <PreviewModal
          item={item}
          isOpen={previewModalOpen}
          onClose={() => setPreviewModelOpen(false)}
        />
      )}
      {shareModalOpen && (
        <ShareItemModal
          item={item}
          isOpen={shareModalOpen}
          onClose={() => setShareModelOpen(false)}
        />
      )}
      {renameModalOpen && (
        <RenameItemModal
          item={item}
          isOpen={renameModalOpen}
          onClose={() => setRenameModelOpen(false)}
        />
      )}
    </>
  );
};
