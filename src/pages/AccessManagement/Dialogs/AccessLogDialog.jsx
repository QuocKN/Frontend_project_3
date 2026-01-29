import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Avatar,
  Divider,
  Stack,
} from "@mui/material";
import {
  Person,
  DevicesOther,
  AccessTime,
  Fingerprint,
  CheckCircle,
  Cancel,
  Room,
} from "@mui/icons-material";

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(timestamp);
  }
};

const AccessLogDialog = ({ open, onClose, data }) => {
  if (!data) return null;

  const { employee, device, timestamp, method, status, faceImage } = data;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AccessTime color="primary" />
          <Typography variant="h6">Chi tiết lịch sử vào ra</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Thông tin nhân viên */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Person color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Thông tin người truy cập
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {employee ? (
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="body1" fontWeight="500">
                        {employee.fullName || "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {employee.employeeCode || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Không xác định nhân viên
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Thông tin thiết bị */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <DevicesOther color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Thông tin thiết bị
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {device ? (
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tên thiết bị
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {device.name || device.deviceId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Device ID
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {device.deviceId}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Vị trí
                    </Typography>
                    <Typography variant="body2">{device.location}</Typography>
                  </Box>
                  {device.room && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phòng
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Room fontSize="small" color="action" />
                        <Typography variant="body2">
                          {device.room.name} ({device.room.code})
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  Không có thông tin thiết bị
                </Typography>
              )}
            </Box>
          </Grid>
          {/* Ảnh khuôn mặt */}
          {faceImage && method === "FACE" && (
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                  Ảnh xác thực khuôn mặt
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={`data:image/jpeg;base64,${faceImage}`}
                    alt="Face verification"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          )}

          {/* Thông tin truy cập */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Fingerprint color="primary" />
                <Typography variant="subtitle1" fontWeight="bold">
                  Chi tiết truy cập
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    Thời gian
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {formatTimestamp(timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    Phương thức
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={method || "N/A"}
                      size="small"
                      color={method === "FACE" ? "primary" : "default"}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary">
                    Trạng thái
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      icon={status ? <CheckCircle /> : <Cancel />}
                      label={status ? "Thành công" : "Thất bại"}
                      size="small"
                      color={status ? "success" : "error"}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessLogDialog;
