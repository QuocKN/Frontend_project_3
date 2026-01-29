import {
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import {
  Search,
  BarChart as BarChartIcon,
  TrendingUp,
  CheckCircle,
  Cancel,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../apis/api";
import { toast } from "react-hot-toast";
import { useTheme } from "@mui/material/styles";

const Reports = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const hasShownToast = useRef(false);

  // Date range state with localStorage
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(() => {
    return localStorage.getItem("reports_startDate") || today;
  });
  const [endDate, setEndDate] = useState(() => {
    return localStorage.getItem("reports_endDate") || today;
  });

  const [stats, setStats] = useState({
    totalLogs: 0,
    successLogs: 0,
    failedLogs: 0,
    successRate: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      toast.error("Vui lòng chọn khoảng thời gian");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Ngày bắt đầu không thể lớn hơn ngày kết thúc");
      return;
    }

    // Lưu ngày đã chọn vào localStorage
    localStorage.setItem("reports_startDate", startDate);
    localStorage.setItem("reports_endDate", endDate);

    setLoading(true);
    try {
      const logsRes = await api.get("/checkin/get-access-logs");
      const logs = logsRes.data?.data || [];

      // Filter logs by date range
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredLogs = logs.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });

      // Calculate days difference
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      let processedChartData;

      if (daysDiff === 1) {
        // Single day: show hourly data
        const hourlyData = Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          success: 0,
          failed: 0,
        }));

        filteredLogs.forEach((log) => {
          const hour = new Date(log.timestamp).getHours();
          log.status ? hourlyData[hour].success++ : hourlyData[hour].failed++;
        });

        const hasData = hourlyData.filter((d) => d.success > 0 || d.failed > 0);
        processedChartData =
          hasData.length > 0 ? hasData : hourlyData.slice(0, 12);
      } else {
        // Multiple days: show daily data
        const dailyData = [];
        const currentDate = new Date(start);

        while (currentDate <= end) {
          const dateStr = currentDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          });

          const dayLogs = filteredLogs.filter((log) => {
            const logDate = new Date(log.timestamp);
            return (
              logDate.getDate() === currentDate.getDate() &&
              logDate.getMonth() === currentDate.getMonth() &&
              logDate.getFullYear() === currentDate.getFullYear()
            );
          });

          dailyData.push({
            label: dateStr,
            success: dayLogs.filter((log) => log.status).length,
            failed: dayLogs.filter((log) => !log.status).length,
          });

          currentDate.setDate(currentDate.getDate() + 1);
        }

        processedChartData = dailyData;
      }

      setChartData(processedChartData);
      setFilteredLogs(filteredLogs);

      const successCount = filteredLogs.filter((log) => log.status).length;
      const failedCount = filteredLogs.filter((log) => !log.status).length;
      const successRate =
        filteredLogs.length > 0
          ? ((successCount / filteredLogs.length) * 100).toFixed(1)
          : 0;

      setStats({
        totalLogs: filteredLogs.length,
        successLogs: successCount,
        failedLogs: failedCount,
        successRate: parseFloat(successRate),
      });

      // Lưu dữ liệu báo cáo vào localStorage
      const reportData = {
        stats: {
          totalLogs: filteredLogs.length,
          successLogs: successCount,
          failedLogs: failedCount,
          successRate: parseFloat(successRate),
        },
        chartData: processedChartData,
        filteredLogs: filteredLogs,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("reports_data", JSON.stringify(reportData));

      //   if (!hasShownToast.current) {
      //     toast.success("Đã tải dữ liệu báo cáo");
      //     hasShownToast.current = true;
      //   }
    } catch (error) {
      toast.error("Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Thành công", value: stats.successLogs },
    { name: "Thất bại", value: stats.failedLogs },
  ];

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  useEffect(() => {
    // Kiểm tra xem có dữ liệu đã lưu trong localStorage không
    const savedData = localStorage.getItem("reports_data");
    const savedStartDate = localStorage.getItem("reports_startDate");
    const savedEndDate = localStorage.getItem("reports_endDate");

    if (savedData && savedStartDate && savedEndDate) {
      try {
        const reportData = JSON.parse(savedData);
        // Kiểm tra dữ liệu không quá 1 giờ (3600000ms)
        const now = new Date().getTime();
        if (now - reportData.timestamp < 3600000) {
          // Load dữ liệu đã lưu
          setStats(reportData.stats);
          setChartData(reportData.chartData);
          setFilteredLogs(reportData.filteredLogs);
          return;
        }
      } catch (error) {
        console.error("Error loading saved report data:", error);
      }
    }

    // Nếu không có dữ liệu đã lưu hoặc đã hết hạn, fetch mới
    fetchReportData();
  }, []);

  const handleNavigateToLogs = (filterType) => {
    const state = {
      filterDateRange: true,
      startDate: startDate,
      endDate: endDate,
    };

    switch (filterType) {
      case "success":
        state.filterSuccess = true;
        break;
      case "failed":
        state.filterFailed = true;
        break;
      default:
        // "all" - không thêm filter status
        break;
    }

    navigate("/attendance", { state });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Thống kê & Báo cáo
      </Typography>

      {/* DATE RANGE FILTER */}
      <Paper sx={{ p: 2.5, mb: 3, width: "98%" }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            label="Từ ngày"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={fetchReportData}
            disabled={loading}
          >
            Tạo báo cáo
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
        </Box>
      ) : chartData.length > 0 ? (
        <>
          {/* SUMMARY STATS */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item sx={{ width: "23%" }} md={3}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleNavigateToLogs("all")}
              >
                <TrendingUp
                  sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                />
                <Typography variant="h4" fontWeight={700}>
                  {stats.totalLogs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng lượt truy cập
                </Typography>
              </Paper>
            </Grid>
            <Grid item sx={{ width: "23%" }} md={3}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleNavigateToLogs("success")}
              >
                <CheckCircle
                  sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                />
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.successLogs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thành công
                </Typography>
              </Paper>
            </Grid>
            <Grid item sx={{ width: "23%" }} md={3}>
              <Paper
                sx={{
                  p: 2.5,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleNavigateToLogs("failed")}
              >
                <Cancel sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {stats.failedLogs.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thất bại
                </Typography>
              </Paper>
            </Grid>
            <Grid item sx={{ width: "23%" }} md={3}>
              <Paper sx={{ p: 2.5, textAlign: "center" }}>
                <TrendingUp sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {stats.successRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tỷ lệ thành công
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* CHARTS */}
          <Grid container spacing={3}>
            {/* BAR CHART */}
            <Grid item sx={{ width: "48%" }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BarChartIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {startDate === endDate
                      ? "Thống kê theo giờ"
                      : "Thống kê theo ngày"}
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
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
              </Paper>
            </Grid>

            {/* PIE CHART */}
            <Grid item sx={{ width: "48%" }}>
              <Paper sx={{ p: 3, height: 450 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Tỷ lệ thành công/thất bại
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 5, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Chọn khoảng thời gian và nhấn "Tạo báo cáo" để xem thống kê
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Reports;
