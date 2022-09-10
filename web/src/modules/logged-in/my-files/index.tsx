import React from "react";
import { useAuth } from "../../auth-context";

export const MyFilesPage: React.FC = () => {
  const auth = useAuth();
  if (!auth.user) {
    return <div>loading...</div>;
  }

  return <div>Welcome back, {auth.user.first_name}!</div>;
};
