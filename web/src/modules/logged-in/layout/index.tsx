import { AppShell, Burger, Header, MediaQuery, Navbar } from "@mantine/core";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth-context";
import { UserAvatar } from "../components/user-avatar";
import { SidebarItem } from "./sidebar-item";

interface LayoutProps {
  children: JSX.Element;
}

export const Layout: React.FC<LayoutProps> = (props) => {
  const navigate = useNavigate();

  const [opened, setOpened] = useState(false);

  const { user } = useAuth();
  if (!user) return null;

  const onUserClicked = () => {
    navigate("/account");
  };

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
              <SidebarItem path="/-/">My Files</SidebarItem>
            </div>
          </Navbar.Section>
          <Navbar.Section grow children={<div />} />
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Navbar.Section>
              <div className="pb-12 md:pb-4">
                <div className="border-0 border-solid border-t-2 border-gray-200 p-4">
                  <div
                    className="p-2 rounded-xl flex flex-row space-x-4 items-center cursor-pointer hover:bg-gray-100"
                    onClick={onUserClicked}
                  >
                    <div>
                      <UserAvatar user={user} />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <div className="font-bold">
                        {user.first_name + " " + user.last_name}
                      </div>
                      <div className="text-sm font-bold">
                        <span className="text-orange-500">@</span>
                        <span className="text-gray-500">{user.username}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-0 border-solid border-t-2 border-gray-100 py-3 flex flex-row space-x-4 justify-center items-center text-xs">
                  <Link to="/about">About us.</Link>
                  <Link to="/about">Bongo's Model.</Link>
                </div>
              </div>
            </Navbar.Section>
          </MediaQuery>
        </Navbar>
      }
      header={
        <Header
          height="70"
          className="flex flex-row items-center justify-between p-5 sm:p-2.5"
        >
          <Link
            to="/-/"
            className="flex flex-row items-center px-2 space-x-4 hover:underline cursor-pointer"
          >
            <img
              src="/images/bongo.png"
              alt="bongo icon"
              className="object-cover w-6 h-6 sm:w-8 sm:h-8"
            />
            <h1 className="text-black sm:my-1.5 my-2 hidden sm:inline text-3xl">
              Bongo Cloud
            </h1>
          </Link>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <div>
              <div className="flex items-center space-x-6 mr-0 sm:mr-4">
                <div className="cursor-pointer" onClick={onUserClicked}>
                  <UserAvatar user={user} size="sm" />
                </div>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                />
              </div>
            </div>
          </MediaQuery>
        </Header>
      }
    >
      {props.children}
    </AppShell>
  );
};
