import React from "react";
import ReactDOM from "react-dom/client"; // Đảm bảo có /client
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme/theme.jsx"; // File theme mình đã tạo trước đó

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      {/* CssBaseline giúp reset CSS và áp dụng màu nền từ theme */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
