import React from "react";
import { MdKeyboardBackspace } from "react-icons/md";
import { Link } from "react-router-dom";

export const NotFoundErrorPage: React.FC = () => {
  return (
    <div className="clouded-bg-container">
      <div className="bg-white max-w-lg p-8 rounded-lg">
        <h1>Page not found (404)</h1>
        <p>
          The page you are looking is not here at Bongo's. Maybe you have a
          spelling error... maybe... 🫤
        </p>
        <p className="mt-4">
          <Link to="/" className="flex flex-row items-center w-fit">
            <MdKeyboardBackspace />
            <span className="ml-2 font-bold">Return home</span>
          </Link>
        </p>
      </div>
    </div>
  );
};
