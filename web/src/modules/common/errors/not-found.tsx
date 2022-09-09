import React from "react";

export const NotFoundErrorPage: React.FC = () => {
  return (
    <div className="clouded-bg-container">
      <div className="p-4 space-y-2 max-w-md">
        <h1 className="text-red-500 text-4xl">Page not found (404)</h1>
        <p className="text-lg text-red-500 font-bold">
          The page you are looking is not here at Bongo's. Maybe you have a
          spelling error... maybe... 🫤
        </p>
      </div>
    </div>
  );
};
