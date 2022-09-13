import { LoadingOverlay } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { User } from "../types";
import { api } from "./api";
import { clearAuthTokens } from "./auth-tokens";
import { ServerErrorPage } from "./common/errors/server-error";

type AuthContextType = {
  user: User | null;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
});

interface AuthProviderProps {
  children: JSX.Element;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const meQuery = useQuery("auth/me", () => api("/auth/me/"));

  useEffect(() => {
    if (!meQuery.data) {
      setUser(null);
    } else if (meQuery.data.status === 200) {
      setUser(meQuery.data.data.user);
    } else if (
      meQuery.data.status === 403 &&
      meQuery.data.data.detail === "User not found"
    ) {
      clearAuthTokens();
    }
  }, [meQuery.data]);

  if (meQuery.isError) {
    return <ServerErrorPage />;
  }

  if (meQuery.isLoading || !user) {
    return (
      <LoadingOverlay
        visible={true}
        loaderProps={{ size: "lg", color: "indigo", variant: "dots" }}
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
