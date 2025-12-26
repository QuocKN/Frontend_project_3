import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Fingerprint,
  Person,
  SettingsRemote,
  History,
  Map,
  BarChart,
  SyncAlt,
  CalendarMonth,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../apis/api";

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy thông tin người dùng từ storage
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    storedUser = raw ? JSON.parse(raw) : null;
  } catch {}
  const displayName =
    storedUser?.fullName || storedUser?.username || "Người dùng";
  const displayEmail = storedUser?.email || "";
  const avatarLetter = (storedUser?.fullName || storedUser?.username || "U")
    .charAt(0)
    .toUpperCase();

  // Danh sách Menu dựa trên Use Case
  const menuItems = [
    { text: "Tổng quan", icon: <DashboardIcon />, path: "/" },
    { text: "Quản lý Sinh trắc", icon: <Fingerprint />, path: "/biometrics" },
    { text: "Quản lý Thiết bị", icon: <SettingsRemote />, path: "/devices" },
    { text: "Quản lý Tòa nhà", icon: <Map />, path: "/buildings" },
    { text: "Quản lý Người vào ra", icon: <Person />, path: "/employees" },
    {
      text: "Quản lý Lịch làm việc",
      icon: <CalendarMonth />,
      path: "/schedules",
    },
    { text: "Lịch sử Vào/Ra", icon: <History />, path: "/attendance" },
    { text: "Thống kê, Báo cáo", icon: <BarChart />, path: "/reports" },
  ];

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    try {
      await api.post(
        "/auth/logout",
        { refreshToken },
        accessToken
          ? { headers: { Authorization: `Bearer ${accessToken}` } }
          : undefined
      );
    } catch (e) {
      // Ignore API errors on logout; proceed to clear local session
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      handleMenuClose();
      navigate("/login");
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#1e293b", // Màu tối cho Sidebar chuyên nghiệp
          color: "#fff",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SyncAlt sx={{ color: "#38bdf8", fontSize: "1rem" }} />
          <Typography
            variant="h7"
            sx={{ fontWeight: "bold", color: "#f8fafc" }}
          >
            ACCESS CONTROL
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />

      <Box
        sx={{ display: "flex", flexDirection: "column", height: "100%", mt: 2 }}
      >
        <List>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem
                key={item.text}
                disablePadding
                sx={{ display: "block" }}
              >
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    mx: 1,
                    borderRadius: 2,
                    mb: 0.5,
                    backgroundColor: isActive
                      ? "rgba(56, 189, 248, 0.1)"
                      : "transparent",
                    color: isActive ? "#38bdf8" : "#94a3b8",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: "center",
                      color: isActive ? "#38bdf8" : "#64748b",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ px: 2, py: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1,
              mx: 1,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.05)",
            }}
          >
            <Tooltip title="Tài khoản">
              <IconButton onClick={handleMenuOpen} sx={{ color: "#e2e8f0" }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: "#e2e8f0" }}>
                {displayName}
              </Typography>
              {displayEmail && (
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  {displayEmail}
                </Typography>
              )}
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/profile");
              }}
            >
              Hồ sơ
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/settings");
              }}
            >
              Cài đặt
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
