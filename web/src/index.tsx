import dayjs from "dayjs";
import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./modules/providers";
import { MyRoutes } from "./modules/routes";
import "./styles/index.css";

var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

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
