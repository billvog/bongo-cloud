import React from "react";
import { useAuth } from "../auth-context";
import { FilesystemProvider } from "./context/filesystem-context";

interface AuthenticatedProvidersProps {
  children: JSX.Element;
}

export const AuthenticatedProviders: React.FC<AuthenticatedProvidersProps> = ({
  children,
}) => {
  const auth = useAuth();
  if (!auth.user) {
    return children;
  }

  return <FilesystemProvider>{children}</FilesystemProvider>;
};
