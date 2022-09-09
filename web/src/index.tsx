import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import { Providers } from "./modules/providers";
import { MyRoutes } from "./modules/routes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Providers>
      <MyRoutes />
    </Providers>
  </React.StrictMode>
);
