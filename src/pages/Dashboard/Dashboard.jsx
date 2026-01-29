import {
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Devices,
  People,
  WarningAmber,
  VerifiedUser,
  AccessTime,
  CheckCircle,
  Cancel,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../../components/StatCard.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import { toast } from "react-hot-toast";
import { useTheme } from "@mui/material/styles";

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    devicesOnline: 0,
    devicesTotal: 0,
    accessLogsToday: 0,
    biometricsCount: 0,
    warningsCount: 0,
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const devicesRes = await api.get("/devices");
        const devicesList = devicesRes.data?.data || [];
        const onlineDevices = devicesList.filter(
          (d) => d.status === "Online"
        ).length;

        const logsRes = await api.get("/checkin/get-access-logs");
        const logs = logsRes.data?.data || [];
        setRecentLogs(logs.slice(-5).reverse());

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLogs = logs.filter((log) => {
          if (!log.timestamp) return false;
          return new Date(log.timestamp) >= today;
        });

        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          success: 0,
          failed: 0,
        }));

        todayLogs.forEach((log) => {
          const hour = new Date(log.timestamp).getHours();
          log.status ? hourlyData[hour].success++ : hourlyData[hour].failed++;
        });

        const filteredData = hourlyData.filter(
          (d) => d.success > 0 || d.failed > 0
        );

        setChartData(
          filteredData.length > 0 ? filteredData : hourlyData.slice(0, 12)
        );

        const bioRes = await api.get("/faceembeddings");
        const biometrics = bioRes.data?.data || [];

        const warnings = todayLogs.filter((log) => log.status === false).length;

        setStats({
          devicesOnline: onlineDevices,
          devicesTotal: devicesList.length,
          accessLogsToday: todayLogs.length,
          biometricsCount: biometrics.length,
          warningsCount: warnings,
        });
      } catch (error) {
        toast.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const panelHeight = 460;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Tổng quan hệ thống
      </Typography>

      {/* STAT CARDS */}
      <Grid container spacing={3} alignItems="stretch">
        <Grid item sx={{ width: "23%" }} md={3}>
          <StatCard
            title="Thiết bị Online"
            value={`${stats.devicesOnline} / ${stats.devicesTotal}`}
            icon={<Devices />}
            color="primary"
            onClick={() => navigate("/devices")}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid item sx={{ width: "23%" }} md={3}>
          <StatCard
            title="Lượt ra vào hôm nay"
            value={stats.accessLogsToday.toLocaleString()}
            icon={<People />}
            color="success"
            onClick={() =>
              navigate("/attendance", { state: { filterToday: true } })
            }
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid item sx={{ width: "23%" }} md={3}>
          <StatCard
            title="Dữ liệu Sinh trắc"
            value={stats.biometricsCount.toLocaleString()}
            icon={<VerifiedUser />}
            color="secondary"
            onClick={() => navigate("/biometrics")}
            sx={{ height: "100%" }}
          />
        </Grid>
        <Grid item sx={{ width: "23%" }} md={3}>
          <StatCard
            title="Cảnh báo lỗi"
            value={stats.warningsCount}
            icon={<WarningAmber />}
            color="error"
            onClick={() =>
              navigate("/attendance", {
                state: { filterToday: true, filterFailed: true },
              })
            }
            sx={{ height: "100%" }}
          />
        </Grid>
      </Grid>

      {/* CHART & RECENT LOGS */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* CHART */}
        <Grid item sx={{ width: "48%" }}>
          <Paper
            sx={{
              p: 3,
              height: panelHeight,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                flexShrink: 0,
              }}
            >
              <BarChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Thống kê truy cập theo giờ</Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="success"
                    fill={theme.palette.success.main}
                    name="Thành công"
                  />
                  <Bar
                    dataKey="failed"
                    fill={theme.palette.error.main}
                    name="Thất bại"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* RECENT LOGS */}
        <Grid item sx={{ width: "48%" }}>
          <Paper
            sx={{
              p: 3,
              height: panelHeight,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                flexShrink: 0,
              }}
            >
              <AccessTime color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Hoạt động gần đây</Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 1.5,
                      borderBottom:
                        index < recentLogs.length - 1 ? "1px solid" : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: log.status ? "success.light" : "error.light",
                        }}
                      >
                        {log.status ? (
                          <CheckCircle
                            sx={{ fontSize: 18, color: "success.main" }}
                          />
                        ) : (
                          <Cancel sx={{ fontSize: 18, color: "error.main" }} />
                        )}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} noWrap>
                          {log.employee?.fullName || "Không xác định"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.device?.room?.name || "N/A"}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </Typography>
                          <Chip
                            label={log.method || "N/A"}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Chưa có hoạt động nào
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
