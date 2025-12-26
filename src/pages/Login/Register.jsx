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
import { Visibility, VisibilityOff, PersonAdd } from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../apis/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate cơ bản
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Đang xử lý...");

    try {
      // Gọi API đăng ký (giả định endpoint là /auth/register)
      const response = await api.post("/auth/register", {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
      });

      if (response.data.success) {
        toast.success("Đăng ký thành công! Đang chuyển hướng...", {
          id: toastId,
        });
        // Chờ 1.5s rồi chuyển sang trang login
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(response.data.message || "Đăng ký thất bại", {
          id: toastId,
        });
      }
    } catch (error) {
      console.error("Register error:", error);
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
            Đăng Ký
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Tạo tài khoản mới để truy cập hệ thống
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Stack spacing={2.5}>
              <TextField
                label="Họ và tên"
                name="fullName"
                fullWidth
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên của bạn"
              />
              <TextField
                label="Tên đăng nhập"
                name="username"
                fullWidth
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Chọn tên đăng nhập"
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
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
              <TextField
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={<PersonAdd />}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: "bold",
                  mt: 2,
                  textTransform: "none",
                }}
              >
                {loading ? "Đang đăng ký..." : "Đăng Ký Tài Khoản"}
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={0.5} sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?
            </Typography>
            <Link
              component={RouterLink}
              to="/login"
              variant="body2"
              underline="hover"
              fontWeight="bold"
            >
              Đăng nhập ngay
            </Link>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
