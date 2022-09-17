import { AppShell, Burger, Header, MediaQuery, Navbar } from "@mantine/core";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth-context";
import { SidebarItem } from "./sidebar-item";

interface LayoutProps {
  children: JSX.Element;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const [opened, setOpened] = useState(false);

  const { user } = useAuth();
  if (!user) return null;

  return (
    <AppShell
      padding={0}
      navbarOffsetBreakpoint={"sm"}
      navbar={
        <Navbar
          width={{ base: "100%", sm: 300 }}
          hiddenBreakpoint="sm"
          hidden={!opened}
        >
          <Navbar.Section>
            <div className="flex flex-col p-4 space-y-2">
              <SidebarItem path="/files">My Files</SidebarItem>
            </div>
          </Navbar.Section>
          <Navbar.Section grow children={<div />} />
          <Navbar.Section>
            <div>
              <div className="border-0 border-solid border-t-2 border-gray-200 p-4">
                <div className="p-2 rounded-xl flex flex-row space-x-4 items-center cursor-pointer hover:bg-slate-100">
                  <div>
                    <img
                      alt="user avatar"
                      src="/images/user-placeholder.png"
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
              <div className="border-0 border-solid border-t-2 border-gray-100 py-3 flex flex-row space-x-4 justify-center items-center text-xs">
                <Link to="#">About us.</Link>
                <Link to="#">Bongo's Model.</Link>
              </div>
            </div>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header
          height="69"
          p="xs"
          className="flex flex-row items-center justify-between"
        >
          <Link
            to="/files"
            className="flex flex-row items-center px-2 space-x-4 hover:underline cursor-pointer"
          >
            <img
              src="/images/bongo.png"
              alt="bongo icon"
              className="object-cover w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1 className="text-black sm:my-1.5 my-2 sm:text-3xl text-2xl">
              Bongo Cloud
            </h1>
          </Link>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              mr="lg"
            />
          </MediaQuery>
        </Header>
      }
    >
      {props.children}
    </AppShell>
  );
};
