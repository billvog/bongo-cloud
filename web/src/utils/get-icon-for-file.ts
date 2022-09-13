import { lookup, mimes } from "mrmime";
import { IconType } from "react-icons";
import { AiOutlineFile } from "react-icons/ai";
import {
  BsFileEarmarkFont,
  BsFileEarmarkRichtext,
  BsFileEarmarkZip,
  BsFillFileEarmarkSpreadsheetFill,
} from "react-icons/bs";
import {
  FaRegFileAudio,
  FaRegFileImage,
  FaRegFilePdf,
  FaRegFilePowerpoint,
  FaRegFileVideo,
  FaRegFileWord,
} from "react-icons/fa";
import { FcKindle } from "react-icons/fc";
import { GoFileBinary } from "react-icons/go";
import { SiAdobephotoshop } from "react-icons/si";

// custom mime-types that mrmime doesn't have.
mimes["psd"] = "image/vnd.adobe.photoshop";
mimes["mkv"] = "video/x-matroska";
mimes["docx"] =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
mimes["azw"] = "application/vnd.amazon.ebook";
mimes["ppt"] = "application/vnd.ms-powerpoint";
mimes["pptx"] =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";
mimes["ods"] = "application/vnd.oasis.opendocument.spreadsheet";
mimes["odp"] = "application/vnd.oasis.opendocument.presentation";
mimes["odt"] = "application/vnd.oasis.opendocument.text";
mimes["7z"] = "application/x-7z-compressed";
mimes["rar"] = "application/vnd.rar";

export const getIconForFile = (name: string): IconType => {
  const mimetype = lookup(name);

  if (!mimetype) {
    return AiOutlineFile;
  }

  if (
    mimetype.startsWith("audio/") ||
    ["application/x-cdf", "application/ogg"].includes(mimetype)
  ) {
    return FaRegFileAudio;
  }

  if (mimetype.startsWith("video/")) {
    return FaRegFileVideo;
  }

  if (mimetype === "image/vnd.adobe.photoshop") {
    return SiAdobephotoshop;
  }

  if (mimetype.startsWith("image/")) {
    return FaRegFileImage;
  }

  if (mimetype.startsWith("font/")) {
    return BsFileEarmarkFont;
  }

  if (mimetype === "application/rtf") {
    return BsFileEarmarkRichtext;
  }

  if (
    [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
    ].includes(mimetype)
  ) {
    return FaRegFileWord;
  }

  if (
    [
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.presentation",
    ].includes(mimetype)
  ) {
    return FaRegFilePowerpoint;
  }

  if (
    [
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ].includes(mimetype)
  ) {
    return BsFillFileEarmarkSpreadsheetFill;
  }

  if (
    [
      "application/x-freearc",
      "application/x-bzip",
      "application/x-bzip2",
      "application/gzip",
      "application/java-archive",
      "application/vnd.rar",
      "application/x-tar",
      "application/zip",
      "application/x-7z-compressed",
    ].includes(mimetype)
  ) {
    return BsFileEarmarkZip;
  }

  if (mimetype === "application/octet-stream") {
    return GoFileBinary;
  }

  if (mimetype === "application/pdf") {
    return FaRegFilePdf;
  }

  if (mimetype === "application/vnd.amazon.ebook") {
    return FcKindle;
  }

  return AiOutlineFile;
};
