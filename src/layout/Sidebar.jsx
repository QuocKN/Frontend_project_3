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
  Schedule,
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
    {
      text: "Quản lý Scheduler",
      icon: <Schedule />,
      path: "/scheduler-control",
    },
    { text: "Quản lý Thiết bị", icon: <SettingsRemote />, path: "/devices" },
    { text: "Quản lý Tòa nhà", icon: <Map />, path: "/buildings" },
    { text: "Quản lý Người truy cập", icon: <Person />, path: "/employees" },
    {
      text: "Quản lý Lịch làm việc",
      icon: <CalendarMonth />,
      path: "/schedules",
    },
    { text: "Lịch sử truy cập", icon: <History />, path: "/attendance" },
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
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          borderRight: "1px solid rgba(148, 163, 184, 0.1)",
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SyncAlt sx={{ color: "#60a5fa", fontSize: "1rem" }} />
          <Typography
            variant="h7"
            sx={{ fontWeight: "bold", color: "#f1f5f9" }}
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
                      ? "rgba(96, 165, 250, 0.15)"
                      : "transparent",
                    color: isActive ? "#60a5fa" : "#cbd5e1",
                    borderLeft: isActive
                      ? "3px solid #60a5fa"
                      : "3px solid transparent",
                    "&:hover": {
                      backgroundColor: "rgba(96, 165, 250, 0.1)",
                      color: "#f1f5f9",
                      borderLeft: "3px solid #60a5fa",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 2,
                      justifyContent: "center",
                      color: isActive ? "#60a5fa" : "#94a3b8",
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
              background:
                "linear-gradient(135deg, rgba(96, 165, 250, 0.08) 0%, rgba(59, 130, 246, 0.12) 100%)",
              border: "1px solid rgba(96, 165, 250, 0.2)",
            }}
          >
            <Tooltip title="Tài khoản">
              <IconButton onClick={handleMenuOpen} sx={{ color: "#f1f5f9" }}>
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: "#f1f5f9" }}>
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
