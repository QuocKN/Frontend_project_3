import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, MeetingRoom } from "@mui/icons-material";
import api from "../../../apis/api";
import toast from "react-hot-toast";
import FloorFormDialog from "./FloorFormDialog";
import RoomManagement from "../RoomManagement/RoomManagement";

const FloorManagementDialog = ({ open, onClose, building }) => {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    open: false,
    isEdit: false,
    data: null,
  });
  const [selectedFloor, setSelectedFloor] = useState(null); // State để lưu tầng đang được chọn xem phòng

  const fetchFloors = async () => {
    if (!building) return;
    setLoading(true);
    try {
      const response = await api.get(`/buildings/${building.id}/floors`);
      if (response.data.success) {
        setFloors(response.data.data || []);
      } else {
        toast.error(response.data.message || "Không thể tải danh sách tầng");
      }
    } catch (error) {
      console.error("Lỗi tải tầng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && building) {
      fetchFloors();
      setSelectedFloor(null); // Reset về danh sách tầng khi mở dialog mới
    }
  }, [open, building]);

  const handleSave = async (formData) => {
    const tId = toast.loading("Đang xử lý...");
    try {
      let response;
      if (formState.isEdit) {
        // Thêm thông tin building vào payload để tránh lỗi null reference ở backend
        response = await api.put(
          `/buildings/${building.id}/floors/${formState.data.id}`,
          { ...formData, building: { id: building.id } }
        );
      } else {
        response = await api.post(`/buildings/${building.id}/floors`, formData);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Thành công", { id: tId });
        fetchFloors();
        setFormState({ ...formState, open: false });
      } else {
        toast.error(response.data.message || "Thất bại", { id: tId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống", { id: tId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tầng này?")) return;
    const tId = toast.loading("Đang xóa...");
    try {
      const response = await api.delete(
        `/buildings/${building.id}/floors/${id}`
      );
      if (response.data.success) {
        toast.success("Đã xóa tầng", { id: tId });
        setFloors((prev) => prev.filter((f) => f.id !== id));
      } else {
        toast.error(response.data.message || "Xóa thất bại", { id: tId });
      }
    } catch (error) {
      toast.error("Lỗi khi xóa tầng", { id: tId });
    }
  };

  const columns = [
    { field: "floorNumber", headerName: "Số", width: 70, align: "center" },
    { field: "code", headerName: "Mã tầng", width: 100 },
    { field: "name", headerName: "Tên tầng", flex: 1 },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (p) => (
        <Typography
          variant="body2"
          sx={{
            color: p.value === "ACTIVE" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {p.value === "ACTIVE" ? "Hoạt động" : "Khóa"}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      renderCell: (params) => (
        <Stack direction="row">
          <Tooltip title="Quản lý phòng">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => setSelectedFloor(params.row)}
            >
              <MeetingRoom fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sửa">
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                setFormState({ open: true, isEdit: true, data: params.row })
              }
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          {selectedFloor
            ? `Quản lý phòng - Tầng ${selectedFloor.name}`
            : `Quản lý tầng - ${building?.name}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedFloor ? (
            // Giao diện quản lý phòng (thay thế giao diện tầng)
            <RoomManagement
              floor={selectedFloor}
              onBack={() => setSelectedFloor(null)}
            />
          ) : (
            // Giao diện quản lý tầng (mặc định)
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">Danh sách tầng</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() =>
                    setFormState({ open: true, isEdit: false, data: null })
                  }
                >
                  Thêm tầng
                </Button>
              </Stack>
              <Box sx={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={floors}
                  columns={columns}
                  loading={loading}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  hideFooter
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <FloorFormDialog
        open={formState.open}
        onClose={() => setFormState({ ...formState, open: false })}
        onSave={handleSave}
        data={formState.data}
        isEdit={formState.isEdit}
      />
    </>
  );
};

export default FloorManagementDialog;
