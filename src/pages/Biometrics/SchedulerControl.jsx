import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Switch,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Refresh,
  Schedule,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import api from "../../apis/api";
import { toast } from "react-hot-toast";

const SchedulerControl = () => {
  const [schedulerStatus, setSchedulerStatus] = useState({
    enabled: false,
    cron: "",
  });
  const [cronInput, setCronInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastTrigger, setLastTrigger] = useState(null);

  // Fetch scheduler status
  const fetchSchedulerStatus = async () => {
    try {
      const response = await api.get("/test/face-embedding/scheduler");
      const data = response.data.data;
      setSchedulerStatus({
        enabled: data.enabled,
        cron: data.cron,
      });
      setCronInput(data.cron);
    } catch (error) {
      toast.error("Không thể tải trạng thái scheduler");
    }
  };

  useEffect(() => {
    fetchSchedulerStatus();
  }, []);

  // Trigger scheduler manually
  const handleTrigger = async () => {
    setLoading(true);
    try {
      await api.post("/test/face-embedding/trigger");
      toast.success("Đã kích hoạt scheduler thủ công");
      setLastTrigger(new Date().toLocaleString("vi-VN"));
    } catch (error) {
      toast.error("Lỗi khi kích hoạt scheduler");
    } finally {
      setLoading(false);
    }
  };

  // Update cron expression
  const handleUpdateCron = async () => {
    if (!cronInput.trim()) {
      toast.error("Vui lòng nhập biểu thức cron");
      return;
    }

    setLoading(true);
    try {
      await api.post("/test/face-embedding/scheduler/cron", null, {
        params: { cron: cronInput },
      });
      toast.success("Đã cập nhật biểu thức cron");
      await fetchSchedulerStatus();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Biểu thức cron không hợp lệ",
      );
    } finally {
      setLoading(false);
    }
  };

  // Enable scheduler
  const handleEnable = async () => {
    setLoading(true);
    try {
      await api.post("/test/face-embedding/scheduler/enable");
      toast.success("Đã bật scheduler");
      await fetchSchedulerStatus();
    } catch (error) {
      toast.error("Không thể bật scheduler");
    } finally {
      setLoading(false);
    }
  };

  // Disable scheduler
  const handleDisable = async () => {
    setLoading(true);
    try {
      await api.post("/test/face-embedding/scheduler/disable");
      toast.success("Đã tắt scheduler");
      await fetchSchedulerStatus();
    } catch (error) {
      toast.error("Không thể tắt scheduler");
    } finally {
      setLoading(false);
    }
  };

  const cronExamples = [
    { label: "Mỗi 5 phút", value: "0 */5 * * * *" },
    { label: "Mỗi 10 phút", value: "0 */10 * * * *" },
    { label: "Mỗi 30 phút", value: "0 */30 * * * *" },
    { label: "Mỗi giờ", value: "0 0 * * * *" },
    { label: "Mỗi ngày lúc 00:00", value: "0 0 0 * * *" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Quản lý Face Embedding Scheduler
          </Typography>
          <Typography variant="body2" color="text.secondary" ml={1} mt={0.5}>
            Điều khiển và cấu hình scheduler đồng bộ embedding
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={3} wrap="nowrap" alignItems="stretch">
        {/* Status Card */}
        <Grid item xs={4}>
          <Card
            sx={{
              height: "100%",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
                lineHeight: 1.4,
              },
            }}
          >
            <CardContent>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 600 }}
                gutterBottom
              >
                Trạng thái Scheduler
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>Trạng thái:</Typography>
                  <Chip
                    size="small"
                    icon={
                      schedulerStatus.enabled ? <CheckCircle /> : <Cancel />
                    }
                    label={schedulerStatus.enabled ? "Đang chạy" : "Đã dừng"}
                    color={schedulerStatus.enabled ? "success" : "default"}
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      "& .MuiChip-icon": {
                        fontSize: 14,
                      },
                      "& .MuiChip-label": {
                        px: 0.5,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography color="text.secondary">
                    Biểu thức Cron hiện tại:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      bgcolor: "grey.100",
                      p: 0.75,
                      borderRadius: 1,
                      mt: 0.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {schedulerStatus.cron || "Chưa cấu hình"}
                  </Typography>
                </Box>

                {lastTrigger && (
                  <Alert severity="info" sx={{ py: 0.5 }}>
                    Lần kích hoạt thủ công cuối: {lastTrigger}
                  </Alert>
                )}

                <Box display="flex" gap={1} mt={1}>
                  {schedulerStatus.enabled ? (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Stop />}
                      onClick={handleDisable}
                      disabled={loading}
                      size="small"
                      fullWidth
                    >
                      Dừng
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<PlayArrow />}
                      onClick={handleEnable}
                      disabled={loading}
                      size="small"
                      fullWidth
                    >
                      Bật
                    </Button>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleTrigger}
                  disabled={loading}
                  size="small"
                  fullWidth
                >
                  Kích hoạt ngay
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Cron Config Card */}
        <Grid item xs={4}>
          <Card
            sx={{
              height: "100%",
              "& .MuiTypography-root": {
                fontSize: "0.85rem",
                lineHeight: 1.4,
              },
            }}
          >
            <CardContent>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 600 }}
                gutterBottom
              >
                Cấu hình Cron Expression
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.5}>
                <TextField
                  fullWidth
                  label="Biểu thức Cron"
                  value={cronInput}
                  onChange={(e) => setCronInput(e.target.value)}
                  placeholder="0 */10 * * * *"
                  helperText="Format: second minute hour day month weekday"
                  size="small"
                />

                <Button
                  variant="contained"
                  onClick={handleUpdateCron}
                  disabled={loading || !cronInput.trim()}
                  size="small"
                  fullWidth
                >
                  Cập nhật Cron
                </Button>

                <Divider />

                <Typography color="text.secondary">Mẫu nhanh:</Typography>

                <Stack spacing={1}>
                  {cronExamples.map((example) => (
                    <Button
                      key={example.value}
                      variant="outlined"
                      size="small"
                      onClick={() => setCronInput(example.value)}
                      sx={{
                        justifyContent: "space-between",
                        textTransform: "none",
                        fontSize: "0.75rem",
                      }}
                    >
                      <span>{example.label}</span>
                      <span style={{ fontFamily: "monospace" }}>
                        {example.value}
                      </span>
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Help Card */}
        <Grid item xs={4}>
          <Card
            sx={{
              height: "100%",
              "& .MuiTypography-root": {
                fontSize: "0.82rem",
                lineHeight: 1.4,
              },
            }}
          >
            <CardContent>
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 600 }}
                gutterBottom
              >
                Hướng dẫn sử dụng Cron Expression
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Alert severity="info" sx={{ py: 0.5, mb: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  Format: second minute hour day month weekday
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li>* – mọi giá trị</li>
                  <li>*/n – mỗi n đơn vị</li>
                  <li>a-b – từ a đến b</li>
                  <li>a,b,c – a hoặc b hoặc c</li>
                </ul>
              </Alert>

              <Stack spacing={1}>
                <Paper sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Typography fontWeight={600} color="primary" gutterBottom>
                    Ví dụ:
                  </Typography>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 16,
                      fontFamily: "monospace",
                    }}
                  >
                    <li>0 0 * * * * – Mỗi giờ</li>
                    <li>0 */5 * * * * – Mỗi 5 phút</li>
                    <li>0 0 0 * * * – 00:00 mỗi ngày</li>
                    <li>0 0 12 * * * – 12:00 mỗi ngày</li>
                    <li>0 0 0 * * 1 – Thứ 2</li>
                  </ul>
                </Paper>

                <Paper sx={{ p: 1.5, bgcolor: "grey.50" }}>
                  <Typography fontWeight={600} color="primary" gutterBottom>
                    Chức năng:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    <li>Bật/Dừng scheduler</li>
                    <li>Kích hoạt thủ công</li>
                    <li>Cập nhật lịch chạy</li>
                    <li>Tự động đồng bộ Face Embedding</li>
                  </ul>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchedulerControl;
