import React, { useContext, useState } from "react";
import { FilesystemItem } from "../../../types";

type FilesystemContextType = {
  current: FilesystemItem | null;
  setCurrent: (item: FilesystemItem | null) => void;
};

export const FilesystemContext = React.createContext<FilesystemContextType>({
  current: null,
  setCurrent: (item) => {},
});

interface FilesystemProviderProps {
  children: JSX.Element;
}

export const FilesystemProvider: React.FC<FilesystemProviderProps> = ({
  children,
}) => {
  const [current, setCurrent] =
    useState<FilesystemContextType["current"]>(null);

  return (
    <FilesystemContext.Provider
      value={{
        current,
        setCurrent: (item) => setCurrent(item),
      }}
    >
      {children}
    </FilesystemContext.Provider>
  );
};

export const useFilesystem = () => {
  return useContext(FilesystemContext);
};
