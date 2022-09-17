import { FilesystemItem } from "../types";
import { lookup } from "mrmime";

export const getItemPreviewableKind = (item: FilesystemItem) => {
  if (!item.is_file) {
    return null;
  }

  const mimetype = lookup(item.name);
  if (!mimetype) {
    return null;
  }

  if (mimetype.startsWith("image/")) {
    return "image";
  }

  if (mimetype.startsWith("video/")) {
    return "video";
  }

  return null;
};
