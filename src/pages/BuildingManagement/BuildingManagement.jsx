import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  DataGrid,
  gridSortedRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Map,
  Layers,
} from "@mui/icons-material";
import BuildingFormDialog from "./Dialogs/BuildingFormDialog";
import BuildingDetailDialog from "./Dialogs/BuildingDetailDialog";
import FloorManagementDialog from "./FloorManagement/FloorManagementDialog";
import api from "../../apis/api";
import { toast } from "react-hot-toast";
const RenderSTT = (params) => {
  const apiRef = useGridApiContext();
  const sortedRowIds = useGridSelector(apiRef, gridSortedRowIdsSelector);
  return sortedRowIds.indexOf(params.id) + 1;
};

const BuildingManagement = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    open: false,
    isEdit: false,
    data: null,
  });
  const [detailState, setDetailState] = useState({ open: false, data: null });
  const [floorManagerState, setFloorManagerState] = useState({
    open: false,
    building: null,
  });

  // 🟩 API: Lấy danh sách (getAll)
  const fetchBuildings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/buildings");
      // Dựa trên JSON của bạn: dữ liệu nằm trong trường .data
      if (response.data.success) {
        setBuildings(response.data.data || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách:", error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  // API: Xóa khu vực (delete)
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tòa nhà này?")) {
      const tId = toast.loading("Đang xóa...");
      try {
        const response = await api.delete(`/buildings/${id}`);
        if (response.data.success) {
          toast.success(response.data.message || "Đã xóa thành công", {
            id: tId,
          });
          // Cập nhật UI ngay lập tức
          setBuildings((prev) => prev.filter((a) => a.id !== id));
        } else {
          toast.error(response.data.message || "Xóa thất bại", { id: tId });
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Lỗi khi xóa!";
        toast.error(errorMsg, { id: tId });
      }
    }
  };

  // 🟦 API: Tạo mới/Cập nhật
  const handleSave = async (formData) => {
    const loadingToast = toast.loading("Đang xử lý...");
    try {
      const response = await api.post("/buildings", formData);

      // Nếu thành công (mã 2xx)
      if (response.data.success) {
        toast.success(response.data.message, { id: loadingToast });
        fetchBuildings();
        setFormState({ ...formState, open: false });
      }
    } catch (error) {
      // Nếu có lỗi (mã 400, 500, v.v.)
      console.error("Lỗi API:", error);

      // Lấy message từ JSON mà GlobalExceptionHandler trả về
      const serverErrorMessage = error.response?.data?.message;
      const finalMessage =
        serverErrorMessage || "Lỗi hệ thống, vui lòng thử lại!";

      toast.error(finalMessage, { id: loadingToast });
    }
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 60,
      renderCell: RenderSTT,
      sortable: false,
    },
    {
      field: "code",
      headerName: "Mã tòa nhà",
      width: 120,
    },
    {
      field: "name",
      headerName: "Tên tòa nhà",
      flex: 1,
      renderCell: (p) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Map color="action" fontSize="small" /> <strong>{p.value}</strong>
        </Stack>
      ),
    },
    {
      field: "address",
      headerName: "Địa chỉ",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (p) => (
        <Box
          sx={{
            bgcolor: p.value === "active" ? "#e8f5e9" : "#ffebee",
            color: p.value === "active" ? "#2e7d32" : "#c62828",
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            fontSize: "0.875rem",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {p.value === "active" ? "Hoạt động" : "Không hoạt động"}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="info"
              onClick={() => setDetailState({ open: true, data: params.row })}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Quản lý tầng">
            <IconButton
              size="small"
              color="secondary"
              onClick={() =>
                setFloorManagerState({ open: true, building: params.row })
              }
            >
              <Layers />
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
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.id)}
            >
              <Delete />
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
          Quản lý Tòa nhà
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            setFormState({ open: true, isEdit: false, data: null })
          }
        >
          Thêm Tòa nhà
        </Button>
      </Stack>

      <Paper sx={{ height: 500, width: "100%", boxShadow: 3 }}>
        <DataGrid
          rows={buildings}
          columns={columns}
          loading={loading}
          disableSelectionOnClick
        />
      </Paper>

      <BuildingFormDialog
        open={formState.open}
        isEdit={formState.isEdit}
        data={formState.data}
        onClose={() => setFormState({ ...formState, open: false })}
        onSave={handleSave} // Truyền hàm save vào dialog
      />

      <BuildingDetailDialog
        open={detailState.open}
        Building={detailState.data}
        onClose={() => setDetailState({ ...detailState, open: false })}
      />

      <FloorManagementDialog
        open={floorManagerState.open}
        building={floorManagerState.building}
        onClose={() =>
          setFloorManagerState({ ...floorManagerState, open: false })
        }
      />
    </Box>
  );
};

export default BuildingManagement;
