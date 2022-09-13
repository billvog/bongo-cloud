import React from "react";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { NotificationsProvider } from "@mantine/notifications";
import { AuthProvider } from "./auth-context";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthenticatedProviders } from "./logged-in/authenticated-providers";

const queryClient = new QueryClient();

interface ProvidersProps {
  children: JSX.Element;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedProviders>
          <BrowserRouter>
            <MantineProvider withGlobalStyles withNormalizeCSS>
              <ModalsProvider>
                <NotificationsProvider>{children}</NotificationsProvider>
              </ModalsProvider>
            </MantineProvider>
          </BrowserRouter>
        </AuthenticatedProviders>
      </AuthProvider>
    </QueryClientProvider>
  );
};
