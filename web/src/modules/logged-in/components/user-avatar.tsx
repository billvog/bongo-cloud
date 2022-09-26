import { Avatar } from "@mantine/core";
import React from "react";
import { User } from "../../../types";

interface UserAvatarProps {
  user: User;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <Avatar
      src={null}
      alt={fullName}
      variant="filled"
      radius="xl"
      color="orange"
    >
      {user.first_name[0] + user.last_name[0]}
    </Avatar>
  );
};
