import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../apis/api";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Vui lòng nhập đủ thông tin");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Đang đăng nhập...");

    try {
      const response = await api.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      if (response.data?.success) {
        // Lưu token và thông tin người dùng theo cấu trúc response
        const payload = response.data?.data;
        const accessToken = payload?.accessToken;
        const refreshToken = payload?.refreshToken;

        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
          // Set header Authorization cho các request sau
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        const user = payload
          ? {
              userId: payload.userId,
              username: payload.username,
              role: payload.role,
              fullName: payload.fullName,
              email: payload.email,
            }
          : null;
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast.success("Đăng nhập thành công!", { id: toastId });
        navigate(from, { replace: true });
      } else {
        toast.error(response.data?.message || "Đăng nhập thất bại", {
          id: toastId,
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Lỗi hệ thống, vui lòng thử lại!";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            Đăng Nhập
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Truy cập hệ thống bằng tài khoản của bạn
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Stack spacing={2.5}>
              <TextField
                label="Tên đăng nhập"
                name="username"
                fullWidth
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
              />
              <TextField
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  mt: 2,
                  textTransform: "none",
                }}
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?
            </Typography>
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              underline="hover"
              fontWeight="bold"
            >
              Đăng ký ngay
            </Link>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
