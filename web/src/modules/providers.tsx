import React from "react";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import { AuthProvider } from "./auth-context";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: JSX.Element;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          <ModalsProvider>
            <NotificationsProvider>
              <AuthProvider>{children}</AuthProvider>
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
