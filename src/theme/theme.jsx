import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Màu xanh đặc trưng cho Admin/Manager
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#9c27b0", // Màu cho các chức năng phụ
    },
    background: {
      default: "#f4f6f8", // Màu nền xám nhạt cho toàn bộ trang Dashboard
      paper: "#ffffff",
    },
    // Các màu trạng thái cho thiết bị/vào ra
    success: {
      main: "#4caf50", // Thiết bị Online
    },
    error: {
      main: "#f44336", // Cảnh báo sinh trắc/Thiết bị Offline
    },
    warning: {
      main: "#ff9800",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Làm bo góc các Card và Button cho hiện đại
  },
  components: {
    // Tùy chỉnh mặc định cho tất cả các nút bấm
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // Bỏ viết hoa toàn bộ chữ trên Button
        },
      },
    },
    // Tùy chỉnh cho các thẻ Card trên Dashboard
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

export default theme;
