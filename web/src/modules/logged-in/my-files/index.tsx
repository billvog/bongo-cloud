import React, { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FilesystemItem } from "../../../types";
import { api, apiDownloadFile } from "../../api";
import { useAuth } from "../../auth-context";
import { FilesystemItemComponent } from "../components/filesystem-item";
import { Layout } from "../layout";

export const MyFilesPage: React.FC = () => {
  const [currentItem, setCurrentItem] = useState<FilesystemItem | null>(null);
  const [items, setItems] = useState<FilesystemItem[]>([]);

  useEffect(() => {
    let url = "/filesystem/";
    if (currentItem) {
      url += currentItem.id + "/";
    }

    api(url).then((response) => {
      if (response.ok) {
        setItems(response.data.items);
      }
    });
  }, [currentItem]);

  const { user } = useAuth();
  if (!user) return null;

  const onItemClicked = async (item: FilesystemItem) => {
    if (item.is_file) {
      apiDownloadFile(item);
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
      <div className="flex flex-col">
        <div className="flex flex-row items-center px-4 py-2 border-solid border-0 border-b-2 border-b-gray-200 bg-gray-100 text-gray-600 space-x-4">
          <IoMdArrowBack
            size={20}
            className={`${
              currentItem ? "text-gray-600 cursor-pointer" : "text-gray-300"
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
                    <span className="font-bold mx-1 cursor-default">/</span>
                    <span className="cursor-pointer hover:underline">{e}</span>
                  </span>
                );
              })}
          </div>
        </div>
        <div className="flex flex-col">
          {items.map((item, index) => (
            <FilesystemItemComponent
              key={item.id}
              index={index}
              item={item}
              onClick={() => onItemClicked(item)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};
