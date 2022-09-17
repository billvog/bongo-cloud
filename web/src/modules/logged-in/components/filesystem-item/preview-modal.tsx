import { Loader, Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { FilesystemItem } from "../../../../types";
import { getItemPreviewableKind } from "../../../../utils/previewable-item";
import { apiGetFilePreview } from "../../../api";

interface PreviewModalProps {
  item: FilesystemItem;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewableKind, setPreviewableKind] =
    useState<ReturnType<typeof getItemPreviewableKind>>(null);

  useEffect(
    () => {
      if (!isOpen || previewUrl) {
        return;
      }

      apiGetFilePreview(item).then(setPreviewUrl);
      setPreviewableKind(getItemPreviewableKind(item));
    },
    // eslint-disable-next-line
    [isOpen]
  );

  if (!isOpen) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.7}
      padding={0}
      withCloseButton={false}
      styles={{
        body: {
          background: "black",
          display: "flex",
          width: "fit-content",
        },
        modal: {
          width: "fit-content",
        },
      }}
    >
      {!previewUrl ? (
        <div className="w-[70vmin] h-[70vmin] flex justify-center items-center">
          <Loader variant="bars" color="orange" />
        </div>
      ) : previewableKind === "image" ? (
        <img
          src={previewUrl}
          alt="preview"
          className="mx-auto object-contain max-w-full max-h-full"
          style={{
            height: "70vmin",
          }}
        />
      ) : previewableKind === "video" ? (
        <video
          src={previewUrl}
          className="mx-auto object-contain max-w-full max-h-full"
          style={{
            height: "70vmin",
          }}
          controls={true}
        />
      ) : null}
    </Modal>
  );
};
