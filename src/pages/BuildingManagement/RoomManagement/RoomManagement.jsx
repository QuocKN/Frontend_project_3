import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, ArrowBack } from "@mui/icons-material";
import api from "../../../apis/api";
import toast from "react-hot-toast";
import RoomFormDialog from "./RoomFormDialog";

const RoomManagement = ({ floor, onBack }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  const fetchRooms = async () => {
    if (!floor) return;
    setLoading(true);
    try {
      // Giả định API: GET /floors/{floorId}/rooms
      const response = await api.get(`/floors/${floor.id}/rooms`);
      if (response.data.success) {
        setRooms(response.data.data || []);
      } else {
        toast.error(response.data.message || "Không thể tải danh sách phòng");
      }
    } catch (error) {
      console.error("Lỗi tải phòng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [floor]);

  const handleSave = async (formData) => {
    const tId = toast.loading("Đang xử lý...");
    try {
      let response;
      // Gửi kèm floor ID để backend map đúng quan hệ
      const payload = { ...formData, floor: { id: floor.id } };

      if (formState.isEdit) {
        // PUT /floors/{floorId}/rooms/{roomId}
        response = await api.put(
          `/floors/${floor.id}/rooms/${formState.data.id}`,
          payload
        );
      } else {
        // POST /floors/{floorId}/rooms
        response = await api.post(`/floors/${floor.id}/rooms`, payload);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Thành công", { id: tId });
        fetchRooms();
        setFormState({ ...formState, open: false });
      } else {
        toast.error(response.data.message || "Thất bại", { id: tId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống", { id: tId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
    const tId = toast.loading("Đang xóa...");
    try {
      // DELETE /floors/{floorId}/rooms/{roomId}
      const response = await api.delete(`/floors/${floor.id}/rooms/${id}`);
      if (response.data.success) {
        toast.success("Đã xóa phòng", { id: tId });
        setRooms((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(response.data.message || "Xóa thất bại", { id: tId });
      }
    } catch (error) {
      toast.error("Lỗi khi xóa phòng", { id: tId });
    }
  };

  const columns = [
    { field: "code", headerName: "Mã phòng", width: 100 },
    { field: "name", headerName: "Tên phòng", flex: 1 },
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
      width: 100,
      renderCell: (params) => (
        <Stack direction="row">
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
    <Box sx={{ height: 400, width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack}>
          Quay lại danh sách tầng
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() =>
            setFormState({ open: true, isEdit: false, data: null })
          }
        >
          Thêm phòng
        </Button>
      </Stack>

      <DataGrid
        rows={rooms}
        columns={columns}
        loading={loading}
        disableSelectionOnClick
        getRowId={(row) => row.id}
        hideFooter
      />

      <RoomFormDialog
        open={formState.open}
        onClose={() => setFormState({ ...formState, open: false })}
        onSave={handleSave}
        data={formState.data}
        isEdit={formState.isEdit}
      />
    </Box>
  );
};

export default RoomManagement;
