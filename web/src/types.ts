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
  parent: string | null;
  name: string;
  is_file: boolean;
  size: number;
  path: string;
  is_shared: boolean;
  download_url: string;
  created_at: Date;
  updated_at: Date;
};

export type FilesystemItemEditable = {
  parent: string | null;
  name: string;
  path: string;
  is_shared: boolean;
};

export type FilesystemSharedItem = {
  id: string;
  sharer: User;
  item: FilesystemItem;
  has_password: boolean;
  does_expire: true;
  expiry: Date | null;
  download_url: string;
};
