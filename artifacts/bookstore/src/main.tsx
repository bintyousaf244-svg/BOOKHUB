import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { setBaseUrl } from "./lib/customFetch";

setBaseUrl("/api");

createRoot(document.getElementById("root")!).render(<App />);