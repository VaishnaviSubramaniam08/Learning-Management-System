import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Import the face-api patch to fix fs module issues
import "./utils/face-api-patch";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
