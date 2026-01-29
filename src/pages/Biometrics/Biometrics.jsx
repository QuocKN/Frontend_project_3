import React, { useState, useEffect } from "react";
import axios from "axios";
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
import api from "../../apis/api";

const Biometrics = () => {
  // 1. Dữ liệu mẫu
  const [rows, setRows] = useState([]);

  // 2. States quản lý Dialog
  const [previewOpen, setPreviewOpen] = useState(false); // Cửa sổ xem chi tiết
  const [formOpen, setFormOpen] = useState(false); // Cửa sổ thêm/sửa thông tin
  const [selectedBio, setSelectedBio] = useState(null); // Dữ liệu đang chọn để xem/sửa
  const [formData, setFormData] = useState({
    name: "",
    type: "Khuôn mặt",
    embedding: [],
    faceImage: null,
  });

  // 3. Lấy dữ liệu từ backend
  useEffect(() => {
    api
      .get("/faceembeddings")
      .then((response) => {
        const transformedData = response.data.data.map((item) => ({
          id: item.id,
          name: item.employee.fullName,
          type: "Khuôn mặt", // Giả sử tất cả đều là sinh trắc khuôn mặt
          code: item.employee.employeeCode,
          embedding: item.embedding,
          faceImage: `data:image/jpeg;base64,${item.faceImage}`, // Convert byte[] to base64 image
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          createdAtTimestamp: new Date(item.createdAt).getTime(), // Thêm timestamp để so sánh
        }));

        // Lọc để chỉ giữ lại bản ghi mới nhất cho mỗi mã nhân viên
        const uniqueByEmployeeCode = {};
        transformedData.forEach((item) => {
          const existingItem = uniqueByEmployeeCode[item.code];
          // Nếu chưa có hoặc bản ghi hiện tại mới hơn thì giữ lại
          if (
            !existingItem ||
            item.createdAtTimestamp > existingItem.createdAtTimestamp
          ) {
            uniqueByEmployeeCode[item.code] = item;
          }
        });

        // Chuyển object thành array
        const filteredData = Object.values(uniqueByEmployeeCode);
        setRows(filteredData);
      })
      .catch((error) => {
        console.error("Error fetching face embeddings:", error);
      });
  }, []);

  // 4. Xử lý Xem chi tiết (Use Case: Xem danh sách sinh trắc)
  const handleViewBio = (row) => {
    setSelectedBio(row);
    setPreviewOpen(true);
  };

  // 5. Xử lý Thêm mới (Use Case: Thêm sinh trắc)
  const handleOpenAdd = () => {
    setSelectedBio(null);
    setFormData({
      name: "",
      type: "Khuôn mặt",
      embedding: [],
      faceImage: null,
    });
    setFormOpen(true);
  };

  // 6. Xử lý Chỉnh sửa (Use Case: Cập nhật sinh trắc)
  const handleOpenEdit = (row) => {
    setSelectedBio(row);
    setFormData({
      name: row.name,
      type: row.type,
      embedding: row.embedding,
      faceImage: row.faceImage,
    });
    setFormOpen(true);
  };

  // 7. Xử lý Lưu thông tin (Thêm mới hoặc Cập nhật)
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
        },
      ]);
    }
    setFormOpen(false);
  };

  // 8. Xử lý Xóa sinh trắc
  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh trắc này không?")) {
      api
        .delete(`/faceembedding/${id}`)
        .then(() => {
          setRows(rows.filter((row) => row.id !== id));
        })
        .catch((error) => {
          console.error("Error deleting face embedding:", error);
        });
    }
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      headerAlign: "center",
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
      flex: 1.5,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "code",
      headerName: "Mã NV",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "type",
      headerName: "Loại",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "createdAt",
      headerName: "Ngày cập nhật",
      flex: 1.2,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Xem chi tiết">
            <IconButton color="info" onClick={() => handleViewBio(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Chỉnh sửa">
            <IconButton
              color="primary"
              onClick={() => handleOpenEdit(params.row)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Xóa">
            <IconButton color="error" onClick={() => handleDelete(params.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
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
        {/* <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Thêm sinh trắc
        </Button> */}
      </Stack>

      <Paper
        sx={{
          height: 500,
          width: "100%",
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />
      </Paper>

      {/* DIALOG 1: Xem chi tiết */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Chi tiết: {selectedBio?.name}</DialogTitle>
        <DialogContent>
          <Typography>Mã NV: {selectedBio?.code}</Typography>
          <Typography>Loại: {selectedBio?.type}</Typography>
          <Typography>Ngày cập nhật: {selectedBio?.createdAt}</Typography>
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Avatar
              variant="rounded"
              src={selectedBio?.faceImage}
              alt={selectedBio?.name}
              sx={{ width: 200, height: 200 }}
            />
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
        <DialogContent>
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
