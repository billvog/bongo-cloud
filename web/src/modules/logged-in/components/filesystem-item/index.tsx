import { ActionIcon, Menu } from "@mantine/core";
import prettyBytes from "pretty-bytes";
import React, { useState } from "react";
import {
  AiFillFolder,
  AiOutlineDownload,
  AiOutlineFile,
  AiOutlineInfoCircle,
} from "react-icons/ai";
import { BiMove, BiRename } from "react-icons/bi";
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { IoTrash } from "react-icons/io5";
import { FilesystemItem } from "../../../../types";
import { apiDownloadFile } from "../../../api";
import { RenameItemModal } from "./rename-item-model";
import { useItemDeleteWithConfirmation } from "./use-item-delete-with-confirmation";

interface FilesystemItemProps {
  item: FilesystemItem;
  onClick: () => any;
}

export const FilesystemItemComponent: React.FC<FilesystemItemProps> = ({
  item,
  onClick,
}) => {
  const deleteItem = useItemDeleteWithConfirmation(item);
  const [renameModalOpen, setRenameModelOpen] = useState(false);

  const onDownloadClicked = () => {
    apiDownloadFile(item);
  };

  const onDeleteClicked = () => deleteItem();
  const onRenameClicked = () => setRenameModelOpen(true);

  return (
    <>
      <div className="flex flex-row items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 border-solid border-0 border-b border-b-gray-200">
        <div
          onClick={onClick}
          className={`flex items-center space-x-2 text-gray-500 hover:text-gray-700 cursor-pointer ${
            item.is_file ? "font-medium" : "font-bold"
          }`}
        >
          {item.is_file ? <AiOutlineFile /> : <AiFillFolder />}
          <div>{item.name}</div>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <div className="text-sm">{prettyBytes(item.size)}</div>
          <div>
            <Menu width={180} position="left" withArrow>
              <Menu.Target>
                <ActionIcon
                  className="cursor-pointer text-orange-300 hover:text-orange-500"
                  variant="transparent"
                >
                  <HiOutlineDotsCircleHorizontal size={20} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label className="text-gray-500 font-bold">
                  {item.name}
                </Menu.Label>
                <Menu.Divider />
                <Menu.Item
                  icon={<AiOutlineDownload size={16} />}
                  onClick={onDownloadClicked}
                >
                  Download
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
                <Menu.Item icon={<BiMove size={16} />}>Move</Menu.Item>
                <Menu.Divider />
                <Menu.Item icon={<AiOutlineInfoCircle size={16} />}>
                  Info
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
      <RenameItemModal
        item={item}
        isOpen={renameModalOpen}
        onClose={() => setRenameModelOpen(false)}
      />
    </>
  );
};
