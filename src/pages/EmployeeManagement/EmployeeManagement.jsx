import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Add, Edit, Delete, Person } from "@mui/icons-material";
import EmployeeFormDialog from "./Dialogs/EmployeeFormDialog";
import api from "../../apis/api";
import { toast } from "react-hot-toast";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get("/employees");
      if (response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        toast.error(response.data.message || "Lỗi tải danh sách người vào ra");
      }
    } catch (error) {
      console.error("Lỗi tải danh sách người vào ra:", error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (formData) => {
    const tId = toast.loading("Đang xử lý...");
    try {
      let response;
      if (formState.isEdit) {
        // Update dùng employeeCode làm ID
        response = await api.put(
          `/employees/${formData.employeeCode}`,
          formData
        );
      } else {
        response = await api.post("/employees", formData);
      }

      if (response.data.success) {
        toast.success(response.data.message || "Thành công", { id: tId });
        fetchEmployees();
        setFormState({ ...formState, open: false });
      } else {
        toast.error(response.data.message || "Thất bại", { id: tId });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống", { id: tId });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người này?")) return;
    const tId = toast.loading("Đang xóa...");
    try {
      const response = await api.delete(`/employees/${id}`);
      if (response.data.success) {
        toast.success("Đã xóa người vào ra", { id: tId });
        setEmployees((prev) => prev.filter((e) => e.employeeCode !== id));
      } else {
        toast.error(response.data.message || "Xóa thất bại", { id: tId });
      }
    } catch (error) {
      toast.error("Lỗi khi xóa người vào ra", { id: tId });
    }
  };

  const columns = [
    {
      field: "employeeCode",
      headerName: "Mã số",
      flex: 1,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "fullName",
      headerName: "Họ và tên",
      flex: 1.5,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "identificationCode",
      headerName: "CCCD/Hộ chiếu",
      flex: 1.2,
      minWidth: 130,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "department",
      headerName: "Phòng ban",
      flex: 1.2,
      minWidth: 130,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (p) => (
        <Chip
          label={p.value ? "Hoạt động" : "Ngung hoạt động"}
          color={p.value ? "success" : "error"}
          bgcolor={p.value ? "success" : "error"}
        />
      ),
    },

    {
      field: "actions",
      headerName: "Thao tác",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" justifyContent="center">
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
              onClick={() => handleDelete(params.row.employeeCode)}
            >
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
          Quản lý người truy cập
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            setFormState({ open: true, isEdit: false, data: null })
          }
        >
          Thêm người truy cập
        </Button>
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
          rows={employees}
          columns={columns}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row.employeeCode} // Sử dụng employeeCode làm ID cho DataGrid
          sx={{
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        />
      </Paper>

      <EmployeeFormDialog
        open={formState.open}
        onClose={() => setFormState({ ...formState, open: false })}
        onSave={handleSave}
        data={formState.data}
        isEdit={formState.isEdit}
      />
    </Box>
  );
};

export default EmployeeManagement;
