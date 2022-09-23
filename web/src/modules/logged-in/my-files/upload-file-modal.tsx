import { Modal, RingProgress, ThemeIcon } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { showNotification, updateNotification } from "@mantine/notifications";
import React from "react";
import { AiFillCheckCircle, AiOutlineCloudUpload } from "react-icons/ai";
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useMutation } from "react-query";
import { apiErrorNotification } from "../../../utils/api-error-update-notification";
import { APIResponse, apiUploadFile } from "../../api";
import { useAPICache } from "../../shared-hooks/use-api-cache";
import { useFilesystem } from "../context/filesystem-context";

const generateUploadNotifIdForFile = (file: FileWithPath) => {
  return `upload_file_notif:${file.name}:${file.size}:${file.lastModified}`;
};

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const filesystem = useFilesystem();

  const RingProgressComponent = (progress: number) => {
    return (
      <RingProgress sections={[{ value: progress, color: "blue" }]} size={40} />
    );
  };

  const apiCache = useAPICache();
  const uploadFileMutation = useMutation<
    APIResponse,
    any,
    {
      parent: string | null;
      name: string;
      uploaded_file: Blob;
      onProgress: (
        xhr: XMLHttpRequest,
        total: number,
        uploaded: number
      ) => void;
    }
  >((values) => {
    return apiUploadFile(
      {
        parent: values.parent,
        name: values.name,
        uploaded_file: values.uploaded_file,
      },
      (xhr, total, uploaded) => values.onProgress(xhr, total, uploaded)
    );
  });

  const uploadFile = async (file: FileWithPath) => {
    const upload_file_notif = generateUploadNotifIdForFile(file);

    updateNotification({
      id: upload_file_notif,
      loading: true,
      title: `Uploading "${file.name}"...`,
      message: "Uploading is about to start...",
      autoClose: false,
    });

    let blob = file as Blob;
    return uploadFileMutation.mutateAsync(
      {
        parent: filesystem.current?.id || null,
        name: file.name,
        uploaded_file: blob,
        onProgress: (xhr, total, uploaded) => {
          updateNotification({
            id: upload_file_notif,
            message: `"${file.name}" is uploading...`,
            icon: RingProgressComponent((uploaded / total) * 100),
            autoClose: false,
            onClose: () => {
              xhr.abort();
            },
          });
        },
      },
      {
        onSuccess: (data) => {
          if (!data.ok) {
            apiErrorNotification(
              upload_file_notif,
              `Failed to upload "${file.name}". Please try again later.`
            );
            return;
          }

          apiCache.addItem(data.data);

          updateNotification({
            id: upload_file_notif,
            loading: false,
            title: `Success`,
            message: `"${file.name}" is uploaded!`,
            icon: (
              <ThemeIcon color="teal" variant="light" radius="xl" size="md">
                <AiFillCheckCircle size={22} />
              </ThemeIcon>
            ),
            color: "blue",
          });
        },
        onError: (error) => {
          console.log(error);
          apiErrorNotification(upload_file_notif);
        },
      }
    );
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      centered
      overlayBlur={3}
      overlayOpacity={0.5}
      title={<span className="font-bold text-lg">Upload your files</span>}
    >
      <div>
        <Dropzone
          onDrop={async (files) => {
            for (const file of files) {
              showNotification({
                id: generateUploadNotifIdForFile(file),
                title: `"${file.name}" is waiting...`,
                message: undefined,
                color: "gray",
                loading: true,
                autoClose: false,
              });
            }

            for (const file of files) {
              await uploadFile(file);
            }
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
          maxSize={1024 * 1024 * 1024 * 10} // 10 GB
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
                Attach as many files as you like, each file should not exceed 10
                GB in size.
              </div>
            </div>
          </div>
        </Dropzone>
      </div>
    </Modal>
  );
};
