import { AppShell, Header, Navbar } from "@mantine/core";
import React from "react";
import { useAuth } from "../../auth-context";
import { SidebarItem } from "./sidebar-item";

interface LayoutProps {
  children: JSX.Element;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <AppShell
      padding={0}
      navbar={
        <Navbar width={{ base: 300 }}>
          <Navbar.Section>
            <div className="flex flex-col p-4 space-y-2">
              <SidebarItem path="/app">Home</SidebarItem>
              <SidebarItem path="/app/files">My Files</SidebarItem>
            </div>
          </Navbar.Section>
          <Navbar.Section grow children={<div />} />
          <Navbar.Section>
            <div className="border-0 border-solid border-t-2 border-gray-200 p-4">
              <div className="p-2 rounded-xl flex flex-row space-x-4 items-center cursor-pointer hover:bg-slate-100">
                <div>
                  <img
                    alt="user avatar"
                    src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
                    className="w-14 h-14 object-cover rounded-full"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="font-bold">
                    {user.first_name + " " + user.last_name}
                  </div>
                  <div className="font-bold text-gray-400 text-sm">
                    @{user.username}
                  </div>
                </div>
              </div>
            </div>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height="70" p="xs">
          <div className="flex flex-row px-2">
            <h1>Bongo Cloud</h1>
          </div>
        </Header>
      }
      styles={{
        main: {
          backgroundColor: "#f8f8f8",
        },
      }}
    >
      {props.children}
    </AppShell>
  );
};
