import React from "react";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import { AuthProvider } from "./auth-context";

interface ProvidersProps {
  children: JSX.Element;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotificationsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
};
