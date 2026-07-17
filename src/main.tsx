// @ts-expect-error - fontsource packages don't have TypeScript declarations
import "@fontsource-variable/fraunces";
// @ts-expect-error - fontsource packages don't have TypeScript declarations
import "@fontsource-variable/inter";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
