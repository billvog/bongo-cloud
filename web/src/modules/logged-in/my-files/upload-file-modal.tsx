import { Modal } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { showNotification, updateNotification } from "@mantine/notifications";
import React from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { apiErrorNotification } from "../../../utils/api-error-update-notification";
import { api } from "../../api";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const uploadFile = (file: FileWithPath) => {
    const upload_file_notif = "upload_file_notif:" + (file.path || file.name);

    showNotification({
      id: upload_file_notif,
      loading: true,
      title: `Uploading "${file.name}"...`,
      message: undefined,
    });

    let blob = file as Blob;
    api(
      "/filesystem/create",
      "POST",
      {
        parent: null,
        name: file.name,
        uploaded_file: blob,
      },
      {
        sendAsFormData: true,
      }
    )
      .then((result) => {
        if (!result.ok) {
          apiErrorNotification(
            upload_file_notif,
            `Failed to upload "${file.name}". Please try again later.`
          );
          return;
        }

        updateNotification({
          id: upload_file_notif,
          loading: false,
          title: `Uploaded "${file.name}"!`,
          message: undefined,
          color: "blue",
        });
      })
      .catch((error) => {
        console.log(error);
        apiErrorNotification(upload_file_notif);
      });
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.5}
      title={<span className="font-bold text-lg">Upload your files.</span>}
    >
      <div>
        <Dropzone
          onDrop={(files) => {
            files.forEach((file) => uploadFile(file));
          }}
          onReject={(files) => {
            files.forEach((f) => {
              const filename = f.file.name;
              const error = f.errors[0];
              showNotification({
                title: `File "${filename}" is invalid.`,
                message: error.message,
                color: "red",
              });
            });
          }}
          maxSize={1024 * 1024 * 1024 * 5} // 5GB
        >
          <div className="flex flex-col justify-center items-center space-y-6 p-3">
            <Dropzone.Accept>
              <AiOutlineCloudUpload size={50} stroke="1.5" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IoMdCloseCircleOutline size={50} stroke="1.5" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <BsFileEarmarkArrowUp size={50} stroke="1.5" />
            </Dropzone.Idle>
            <div className="space-y-1">
              <div className="font-bold text-lg">
                Drag files here or click to select files.
              </div>
              <div className="text-sm text-gray-500">
                Attach as many files as you like, each file should not exceed
                5GB in size.
              </div>
            </div>
          </div>
        </Dropzone>
      </div>
    </Modal>
  );
};
