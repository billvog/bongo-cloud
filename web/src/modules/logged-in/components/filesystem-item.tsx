import prettyBytes from "pretty-bytes";
import React from "react";
import { FilesystemItem } from "../../../types";
import { AiFillFolder, AiOutlineFile } from "react-icons/ai";

interface FilesystemItemProps {
  index: number;
  item: FilesystemItem;
  onClick: () => any;
}

export const FilesystemItemComponent: React.FC<FilesystemItemProps> = ({
  index,
  item,
  onClick,
}) => {
  const isOdd = index % 2 !== 0;

  return (
    <div
      className={`flex flex-row items-center justify-between px-4 py-2 cursor-pointer ${
        isOdd ? "bg-gray-100" : "bg-gray-50"
      } group`}
      onClick={onClick}
    >
      <div
        className={`flex items-center space-x-2 text-gray-500 group-hover:text-gray-700 ${
          item.is_file ? "font-medium" : "font-bold"
        }`}
      >
        {item.is_file ? <AiOutlineFile /> : <AiFillFolder />}
        <div>{item.name}</div>
      </div>
      <div className="text-sm">{prettyBytes(item.size)}</div>
    </div>
  );
};
