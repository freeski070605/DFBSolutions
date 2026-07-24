import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ProjectsProvider } from "./context/ProjectsContext.jsx";
import { DivisionsProvider } from "./context/DivisionsContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProjectsProvider>
        <DivisionsProvider>
          <App />
        </DivisionsProvider>
      </ProjectsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
