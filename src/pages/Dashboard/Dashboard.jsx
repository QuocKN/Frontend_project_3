import { Grid, Typography, Box, Paper } from "@mui/material";
import {
  Devices,
  People,
  WarningAmber,
  VerifiedUser,
} from "@mui/icons-material";
import StatCard from "../../components/StatCard.jsx";
const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
        Tổng quan hệ thống
      </Typography>

      <Grid container spacing={3}>
        {/* Hàng 1: Thống kê nhanh */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Thiết bị Online"
            value="12 / 15"
            icon={<Devices />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lượt ra vào hôm nay"
            value="1,245"
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dữ liệu Sinh trắc"
            value="450"
            icon={<VerifiedUser />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cảnh báo lỗi"
            value="3"
            icon={<WarningAmber />}
            color="error"
          />
        </Grid>

        {/* Hàng 2: Biểu đồ & Danh sách (Mockup) */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 3,
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">
              [ Biểu đồ thống kê lượt ra vào theo giờ sẽ hiển thị ở đây ]
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "300px" }}>
            <Typography variant="h6" gutterBottom>
              Trạng thái thiết bị (MQTT)
            </Typography>
            <Box sx={{ mt: 2 }}>
              {["Cửa chính", "Cửa hậu", "Phòng Server"].map((device, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">{device}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "success.main", fontWeight: "bold" }}
                  >
                    ONLINE
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
