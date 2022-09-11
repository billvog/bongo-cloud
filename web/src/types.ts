export type User = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  date_joined: Date;
};

export type FilesystemItem = {
  id: string;
  parent: FilesystemItem;
  name: string;
  is_file: boolean;
  size: number;
  path: string;
  uploaded_file: string;
};
