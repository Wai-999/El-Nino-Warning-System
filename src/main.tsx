import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/noto-sans-myanmar/myanmar-400.css";
import "@fontsource/noto-sans-myanmar/myanmar-600.css";
import App from "./app/App";
import "./styles/main.css";
import "./styles/responsive.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
if ("serviceWorker" in navigator && import.meta.env.PROD)
  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        /* App remains usable without offline caching. */
      });
  });

import "./styles/operational.css";
