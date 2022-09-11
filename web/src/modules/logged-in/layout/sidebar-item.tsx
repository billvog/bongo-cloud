import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarItemProps {
  children: JSX.Element | string;
  path: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = (props) => {
  const [isActive, setIsActive] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsActive(location.pathname === props.path);
  }, [location.pathname]);

  const onClick = () => {
    navigate(props.path);
  };

  return (
    <div
      className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
        isActive ? "bg-gray-50" : ""
      } hover:bg-gray-100`}
      onClick={onClick}
    >
      {props.children}
    </div>
  );
};
