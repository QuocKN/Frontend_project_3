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
import dayjs from "dayjs";
import { toast } from "react-hot-toast";

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
      alert(
        `Lỗi: ${error.response?.data?.message || "Đã xảy ra lỗi khi xóa lịch."}`
      );
    }
  };

  const handleSave = async (formData) => {
    const tId = toast.loading("Đang lưu...");
    try {
      const isEdit = dialogState.isEdit;
      const url = isEdit ? `/schedules/${dialogState.data.id}` : "/schedules";

      // Validate and initialize specificDate, startTime, and endTime
      const specificDate = formData.specificDate
        ? dayjs(formData.specificDate)
        : null;
      const startTime = formData.startTime ? dayjs(formData.startTime) : null;
      const endTime = formData.endTime ? dayjs(formData.endTime) : null;

      // Transform form data to backend model
      const payload = {
        employeeCode: formData.employee, // Ensure Dialog provides code, not name
        roomCode: formData.area, // Send roomCode for backend lookup
        specificDate: specificDate?.isValid()
          ? specificDate.format("YYYY-MM-DD")
          : null,
        startTime: startTime?.isValid() ? startTime.format("HH:mm") : null,
        endTime: endTime?.isValid() ? endTime.format("HH:mm") : null,
        weekday: formData.weekday || null, // Support recurring schedules
        effectiveFrom: formData.effectiveFrom || null,
        effectiveTo: formData.effectiveTo || null,
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
        toast.success(response.data.message || "Thành công", { id: tId });
      } else {
        toast.error(response.data?.message || "Thao tác thất bại", { id: tId });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Có lỗi xảy ra khi lưu.", { id: tId });
    }
  };

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 70,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: RenderSTT,
    },
    {
      field: "employee",
      headerName: "Nhân sự",
      flex: 1.5,
      minWidth: 180,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) =>
        row?.employee?.fullName || row?.employee?.employeeCode,
      renderCell: (p) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%" }}
        >
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
      flex: 1.2,
      minWidth: 140,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row?.room?.name || "N/A",
    },
    {
      field: "dateInfo",
      headerName: "Ngày / Thứ",
      flex: 1,
      minWidth: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => row?.specificDate || row?.weekday,
      renderCell: (params) => {
        if (params.row.weekday) {
          const dayMap = {
            MONDAY: "Thứ hai",
            TUESDAY: "Thứ ba",
            WEDNESDAY: "Thứ tư",
            THURSDAY: "Thứ năm",
            FRIDAY: "Thứ sáu",
            SATURDAY: "Thứ bảy",
            SUNDAY: "Chủ nhật",
          };
          const displayDay = dayMap[params.row.weekday] || params.row.weekday;
          return <Typography variant="body2">{displayDay}</Typography>;
        }
        return (
          <Typography variant="body2">{params.row.specificDate}</Typography>
        );
      },
    },
    {
      field: "startTime",
      headerName: "Bắt đầu",
      flex: 0.8,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => {
        if (!row?.startTime) return "";
        return row.startTime.substring(0, 5); // Only show HH:mm
      },
    },
    {
      field: "endTime",
      headerName: "Kết thúc",
      flex: 0.8,
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      valueGetter: (value, row) => {
        if (!row?.endTime) return "";
        return row.endTime.substring(0, 5); // Only show HH:mm
      },
    },
    {
      field: "type",
      headerName: "Loại lịch",
      flex: 1,
      minWidth: 110,
      align: "center",
      headerAlign: "center",
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
      field: "effectivePeriod",
      headerName: "Thời gian hiệu lực",
      flex: 1.5,
      minWidth: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.row.weekday) {
          return (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          );
        }
        const from = params.row.effectiveFrom || "...";
        const to = params.row.effectiveTo || "...";
        return (
          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
            {from} → {to}
          </Typography>
        );
      },
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 130,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="center">
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
            Quản lý lịch làm việc
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
      <Paper
        sx={{
          height: 480,
          width: "100%",
          boxShadow: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
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
              justifyContent: "center",
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
