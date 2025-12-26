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
import {
  DataGrid,
  gridSortedRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { Add, Edit, Delete, EventNote } from "@mui/icons-material";
import ScheduleDialog from "./Dialogs/ScheduleDialog.jsx";
import api from "../../apis/api";

/* ===== STT theo thứ tự sort ===== */
const RenderSTT = (params) => {
  const apiRef = useGridApiContext();
  const sortedRowIds = useGridSelector(apiRef, gridSortedRowIdsSelector);
  return sortedRowIds.indexOf(params.id) + 1;
};

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      // Sử dụng api instance (đã cấu hình baseURL)
      const response = await api.get("/schedules");
      if (response.data && response.data.success) {
        setSchedules(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const [dialogState, setDialogState] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  // Function to handle delete via API
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch này?")) return;

    try {
      const response = await api.delete(`/schedules/${id}`);
      if (response.status === 200 || response.data.success) {
        fetchSchedules();
      } else {
        alert(`Lỗi: ${response.data?.message || "Không thể xóa lịch"}`);
      }
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert(`Lỗi: ${error.response?.data?.message || "Đã xảy ra lỗi khi xóa lịch."}`);
    }
  };

  const handleSave = async (formData) => {
    try {
      const isEdit = dialogState.isEdit;
      const url = isEdit ? `/schedules/${dialogState.data.id}` : "/schedules";

      // Transform form data to backend model
      const payload = {
        employeeCode: formData.employee, // Note: Ensure Dialog provides code, not name
        roomCode: formData.area, // Gửi roomCode để backend tìm bằng findByCode
        // Assuming specific date for now based on Dialog structure
        specificDate: formData.start.format("YYYY-MM-DD"),
        startTime: formData.start.format("HH:mm:ss"),
        endTime: formData.end.format("HH:mm:ss"),
        weekday: null, // Chưa hỗ trợ lịch định kỳ từ dialog hiện tại
      };

      let response;
      if (isEdit) {
        response = await api.put(url, payload);
      } else {
        response = await api.post(url, payload);
      }

      if (response.data && response.data.success) {
        fetchSchedules();
        setDialogState({ ...dialogState, open: false });
        alert(response.data.message);
      } else {
        alert(`Lỗi: ${response.data?.message || "Thao tác thất bại"}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      alert(`Lỗi: ${error.response?.data?.message || "Có lỗi xảy ra khi lưu."}`);
    }
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 60,
      sortable: false,
      renderCell: RenderSTT,
    },
    {
      field: "employee",
      headerName: "Nhân sự",
      flex: 1.2,
      minWidth: 220,
      valueGetter: (value, row) =>
        row?.employee?.fullName || row?.employee?.employeeCode,
      renderCell: (p) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <EventNote fontSize="small" color="primary" />
          <Tooltip title={p.value}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {p.value}
            </Typography>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: "room",
      headerName: "Khu vực",
      flex: 1,
      minWidth: 160,
      valueGetter: (value, row) => row?.room?.name || "N/A",
    },
    {
      field: "dateInfo",
      headerName: "Ngày / Thứ",
      flex: 1,
      minWidth: 140,
      valueGetter: (value, row) => row?.specificDate || row?.weekday,
      renderCell: (params) => {
        if (params.row.weekday) {
          return (
            <Chip
              label={params.row.weekday}
              size="small"
              color="info"
              variant="outlined"
            />
          );
        }
        return (
          <Typography variant="body2">{params.row.specificDate}</Typography>
        );
      },
    },
    {
      field: "startTime",
      headerName: "Bắt đầu",
      width: 120,
    },
    {
      field: "endTime",
      headerName: "Kết thúc",
      width: 120,
    },
    {
      field: "type",
      headerName: "Loại lịch",
      width: 130,
      renderCell: (p) => {
        const isRecurring = !!p.row.weekday;
        return (
          <Chip
            label={isRecurring ? "Định kỳ" : "Theo ngày"}
            size="small"
            color={isRecurring ? "primary" : "success"}
            variant="outlined"
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Cập nhật lịch">
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                setDialogState({
                  open: true,
                  isEdit: true,
                  data: params.row,
                })
              }
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa lịch">
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
    <Box sx={{ p: 3 }}>
      {/* ===== Header ===== */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Quản lý Lịch làm việc
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Điều phối nhân sự và thời gian truy cập các khu vực
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() =>
            setDialogState({ open: true, isEdit: false, data: null })
          }
        >
          Tạo lịch mới
        </Button>
      </Stack>

      {/* ===== Table ===== */}
      <Paper sx={{ height: 520, width: "100%", borderRadius: 2 }}>
        <DataGrid
          rows={schedules}
          columns={columns}
          rowHeight={52}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f5f7fa",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
            },
          }}
        />
      </Paper>

      {/* ===== Dialog ===== */}
      <ScheduleDialog
        open={dialogState.open}
        isEdit={dialogState.isEdit}
        data={dialogState.data}
        onClose={() => setDialogState({ ...dialogState, open: false })}
        onSave={handleSave}
      />
    </Box>
  );
};

export default ScheduleManagement;
