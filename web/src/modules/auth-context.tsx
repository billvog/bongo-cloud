import { LoadingOverlay } from "@mantine/core";
import React, { useContext, useEffect, useState } from "react";
import { User } from "../types";
import { api } from "./api";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  setUser(user) {},
});

interface AuthProviderProps {
  children: JSX.Element;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/auth/me/").then((response) => {
      setLoading(false);
      if (response.status === 200) {
        setUser(response.data.user);
      }
    });
  }, []);

  if (loading) {
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
        setUser(user) {
          setUser(user);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
