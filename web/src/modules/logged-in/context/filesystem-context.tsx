import React, { useContext, useRef, useState } from "react";
import { FilesystemItem } from "../../../types";

type FilesystemContextType = {
  current: FilesystemItem | null;
  currentRef: React.MutableRefObject<FilesystemItem | null | undefined> | null;
  setCurrent: (item: FilesystemItem | null) => void;
};

export const FilesystemContext = React.createContext<FilesystemContextType>({
  current: null,
  currentRef: null,
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
  const currentRef = useRef<typeof current>();
  currentRef.current = current;

  return (
    <FilesystemContext.Provider
      value={{
        current,
        currentRef,
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
