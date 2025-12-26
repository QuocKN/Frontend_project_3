import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Avatar,
  TextField,
  MenuItem,
} from "@mui/material";
import { DataGrid, gridSortedRowIdsSelector } from "@mui/x-data-grid";
import {
  Delete,
  Add,
  Edit,
  Visibility,
  Fingerprint,
  Face,
} from "@mui/icons-material";

const Biometrics = () => {
  // 1. Dữ liệu mẫu
  const [rows, setRows] = useState([
    {
      id: "E001",
      name: "Nguyễn Văn A",
      type: "Vân tay",
      date: "2024-03-20",
      status: "Hoạt động",
      img: "https://img.freepik.com/premium-vector/biometric-identification-fingerprint-scanning-system-isolated-white-background_165488-1008.jpg",
    },
    {
      id: "E002",
      name: "Trần Thị B",
      type: "Khuôn mặt",
      date: "2024-03-21",
      status: "Hoạt động",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
  ]);

  // 2. States quản lý Dialog
  const [previewOpen, setPreviewOpen] = useState(false); // Cửa sổ xem chi tiết
  const [formOpen, setFormOpen] = useState(false); // Cửa sổ thêm/sửa thông tin
  const [selectedBio, setSelectedBio] = useState(null); // Dữ liệu đang chọn để xem/sửa
  const [formData, setFormData] = useState({ name: "", type: "Vân tay" });

  // 3. Xử lý Xem chi tiết (Use Case: Xem danh sách sinh trắc)
  const handleViewBio = (row) => {
    setSelectedBio(row);
    setPreviewOpen(true);
  };

  // 4. Xử lý Thêm mới (Use Case: Thêm sinh trắc)
  const handleOpenAdd = () => {
    setSelectedBio(null);
    setFormData({ name: "", type: "Vân tay" });
    setFormOpen(true);
  };

  // 5. Xử lý Chỉnh sửa (Use Case: Cập nhật sinh trắc)
  const handleOpenEdit = (row) => {
    setSelectedBio(row);
    setFormData({ name: row.name, type: row.type });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (selectedBio) {
      // Logic Cập nhật
      setRows(
        rows.map((r) => (r.id === selectedBio.id ? { ...r, ...formData } : r))
      );
    } else {
      // Logic Thêm mới
      const newId =
        rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      setRows([
        ...rows,
        {
          id: newId,
          ...formData,
          date: new Date().toISOString().split("T")[0],
          status: "Hoạt động",
          img:
            formData.type === "Vân tay"
              ? "https://img.freepik.com/premium-vector/biometric-identification-fingerprint-scanning-system-isolated-white-background_165488-1008.jpg"
              : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        },
      ]);
    }
    setFormOpen(false);
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        // 1. Lấy danh sách ID đã được Sort/Filter đang hiển thị
        const sortedIds = gridSortedRowIdsSelector(params.api.state);

        // 2. Tìm vị trí của ID hiện tại trong danh sách đó
        const index = sortedIds.indexOf(params.id);

        // 3. Trả về STT cố định theo vị trí dòng
        return index + 1;
      },
    },
    {
      field: "name",
      headerName: "Họ và tên",
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: "primary.main",
              fontSize: "0.8rem",
            }}
          >
            {params.value.charAt(0)}
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Stack>
      ),
    },
    { field: "id", headerName: "ID", width: 120 },

    { field: "type", headerName: "Loại", width: 120 },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton color="info" onClick={() => handleViewBio(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              color="primary"
              onClick={() => handleOpenEdit(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              color="error"
              onClick={() => setRows(rows.filter((r) => r.id !== params.id))}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" fontWeight="bold">
          Quản lý Sinh trắc
        </Typography>
        {/* Đã thêm onClick ở đây */}
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Thêm sinh trắc
        </Button>
      </Stack>

      <Paper sx={{ height: 450, width: "100%", boxShadow: 3 }}>
        <DataGrid rows={rows} columns={columns} disableSelectionOnClick />
      </Paper>

      {/* DIALOG 1: Xem chi tiết */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {selectedBio?.type === "Vân tay" ? (
            <Fingerprint color="primary" />
          ) : (
            <Face color="primary" />
          )}
          Chi tiết: {selectedBio?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: "center" }}>
          <Box
            component="img"
            src={selectedBio?.img}
            sx={{ width: "100%", maxHeight: 200, objectFit: "contain", mb: 2 }}
          />
          <Box sx={{ textAlign: "left" }}>
            <Typography variant="body2">
              <strong>ID:</strong> {selectedBio?.id}
            </Typography>
            <Typography variant="body2">
              <strong>Ngày đăng ký:</strong> {selectedBio?.date}
            </Typography>
            <Typography variant="body2">
              <strong>Trạng thái:</strong> {selectedBio?.status}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG 2: Thêm/Sửa (Use Case: Thêm & Cập nhật) */}
      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {selectedBio ? "Cập nhật sinh trắc" : "Đăng ký sinh trắc mới"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Họ và tên"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Loại sinh trắc"
            margin="normal"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="Vân tay">Vân tay</MenuItem>
            <MenuItem value="Khuôn mặt">Khuôn mặt</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedBio ? "Lưu thay đổi" : "Bắt đầu quét"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Biometrics;
