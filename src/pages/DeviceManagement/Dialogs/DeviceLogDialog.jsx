import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const DeviceLogDialog = ({ open, onClose, device }) => {
  // Dữ liệu log mẫu (Thực tế sẽ gọi API lấy từ Database/MQTT Log)
  const logRows = [
    {
      id: 1,
      time: "2024-03-20 08:30:05",
      event: "Kết nối (Online)",
      details: "IP: 192.168.1.15",
    },
    {
      id: 2,
      time: "2024-03-20 10:15:20",
      event: "Nhận diện vân tay",
      details: "User ID: 01 - Thành công",
    },
    {
      id: 3,
      time: "2024-03-20 17:45:12",
      event: "Mất kết nối",
      details: "Ping timeout",
    },
  ];

  const columns = [
    { field: "time", headerName: "Thời gian", width: 180 },
    {
      field: "event",
      headerName: "Sự kiện",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={params.value.includes("Kết nối") ? "success" : "default"}
        />
      ),
    },
    { field: "details", headerName: "Chi tiết bản tin", flex: 1 },
  ];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Lịch sử hoạt động:{" "}
        <Typography component="span" fontWeight="bold" color="primary">
          {device?.name}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={logRows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceLogDialog;
