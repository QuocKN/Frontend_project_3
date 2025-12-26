import { Box, Toolbar, AppBar, Typography, Button } from "@mui/material";
import { Outlet, Link as RouterLink } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      ></AppBar>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "background.default",
          minHeight: "100vh",
        }}
      >
        {/* Toolbar này để đẩy nội dung xuống dưới Topbar (nếu có) */}
        <Toolbar />

        {/* Outlet là nơi Dashboard.jsx hoặc các trang con khác sẽ hiển thị */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
