import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from "@mui/material";
import {
  DataGrid,
  gridSortedRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import { Add, Edit, Delete, FilterList, Download } from "@mui/icons-material";
import AccessLogDialog from "./Dialogs/AccessLogDialog";
import api from "../../apis/api";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";

// Component hiển thị STT không thay đổi khi sort
const RenderSTT = (params) => {
  const apiRef = useGridApiContext();
  const sortedRowIds = useGridSelector(apiRef, gridSortedRowIdsSelector);
  return sortedRowIds.indexOf(params.id) + 1;
};

// Hàm format thời gian
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  } catch {
    return String(timestamp);
  }
};

const AccessManagement = () => {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const hasShownToast = useRef(false);

  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  // Fetch access logs từ API
  useEffect(() => {
    const fetchAccessLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get("/checkin/get-access-logs");
        let logs = res.data?.data || [];

        // Nếu có filterDateRange từ Reports, lọc theo khoảng ngày
        if (location.state?.filterDateRange) {
          const start = new Date(location.state.startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(location.state.endDate);
          end.setHours(23, 59, 59, 999);

          logs = logs.filter((log) => {
            if (!log.timestamp) return false;
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
          });
        }
        // Nếu có filterToday từ Dashboard, lọc theo ngày hôm nay
        else if (location.state?.filterToday) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          logs = logs.filter((log) => {
            if (!log.timestamp) return false;
            const logDate = new Date(log.timestamp);
            return logDate >= today;
          });
        }

        // Nếu có filterSuccess, lọc chỉ lấy các lượt thành công
        if (location.state?.filterSuccess) {
          logs = logs.filter((log) => log.status === true);
        }

        // Nếu có filterFailed, lọc chỉ lấy các lượt thất bại
        if (location.state?.filterFailed) {
          logs = logs.filter((log) => log.status === false);
        }

        setRows(logs);

        // Hiển thị thông báo tùy theo filter - chỉ 1 lần
        if (!hasShownToast.current && location.state) {
          if (location.state?.filterDateRange) {
            const startStr = new Date(
              location.state.startDate
            ).toLocaleDateString("vi-VN");
            const endStr = new Date(location.state.endDate).toLocaleDateString(
              "vi-VN"
            );
            let message = `Đã lọc ${logs.length} lượt truy cập từ ${startStr} đến ${endStr}`;

            if (location.state?.filterSuccess) {
              message = `Đã lọc ${logs.length} lượt thành công từ ${startStr} đến ${endStr}`;
            } else if (location.state?.filterFailed) {
              message = `Đã lọc ${logs.length} lượt thất bại từ ${startStr} đến ${endStr}`;
            }

            toast.success(message);
          } else if (
            location.state?.filterToday &&
            location.state?.filterFailed
          ) {
            toast.success(
              `Đã lọc ${logs.length} lượt truy cập thất bại hôm nay`
            );
          } else if (location.state?.filterToday) {
            toast.success(`Đã lọc ${logs.length} lượt truy cập hôm nay`);
          } else if (location.state?.filterSuccess) {
            toast.success(`Đã lọc ${logs.length} lượt truy cập thành công`);
          } else if (location.state?.filterFailed) {
            toast.success(`Đã lọc ${logs.length} lượt truy cập thất bại`);
          }
          hasShownToast.current = true;
        }
      } catch (error) {
        toast.error("Không thể tải lịch sử vào ra");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccessLogs();
  }, [location.state]);

  // Reset flag khi location state thay đổi
  useEffect(() => {
    hasShownToast.current = false;
  }, [location.state]);

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 60,
      renderCell: RenderSTT,
      sortable: false,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "employee",
      headerName: "Người truy cập",
      flex: 1.5,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const employee = params.value;
        if (!employee)
          return <Typography color="text.secondary">Không xác định</Typography>;
        return (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            {employee.fullName || "N/A"}
          </Stack>
        );
      },
    },
    {
      field: "timestamp",
      headerName: "Thời gian",
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => formatTimestamp(params),
    },
    {
      field: "device",
      headerName: "Phòng",
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const device = params.value;
        if (!device) return "—";
        const roomCode = device.room?.code || "N/A";
        return <Box>{roomCode}</Box>;
      },
    },
    {
      field: "method",
      headerName: "Phương thức",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value || "N/A"}
          color={params.value === "FACE" ? "primary" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Chip
          label={params.value ? "Thành công" : "Thất bại"}
          color={params.value ? "success" : "error"}
          size="small"
        />
      ),
    },

    {
      field: "actions",
      headerName: "Thao tác",
      width: 150,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={() =>
                setDialog({ open: true, isEdit: true, data: params.row })
              }
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const ok = window.confirm("Bạn có chắc muốn xóa log này?");
                if (!ok) return;
                try {
                  await api.delete(`/checkin/access-logs/${params.row.id}`);
                  setRows(rows.filter((r) => r.id !== params.id));
                  toast.success("Đã xóa log");
                } catch (error) {
                  toast.error("Không thể xóa log");
                }
              }}
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
      {/* Header Area */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lịch sử truy cập
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi lịch sử truy cập hệ thống thời gian thực
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Xuất báo cáo
          </Button>
          {/* <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialog({ open: true, isEdit: false, data: null })}
          >
            Thêm lượt vào ra
          </Button> */}
        </Stack>
      </Stack>

      {/* Main Table */}
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
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f1f5f9",
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .MuiDataGrid-cell:hover": { color: "primary.main" },
          }}
        />
      </Paper>

      {/* Dialog for Add/Edit */}
      <AccessLogDialog
        open={dialog.open}
        isEdit={dialog.isEdit}
        data={dialog.data}
        onClose={() => setDialog({ ...dialog, open: false })}
        onSave={() => {
          alert("Dữ liệu đã được lưu thành công!");
          setDialog({ ...dialog, open: false });
        }}
      />
    </Box>
  );
};

export default AccessManagement;
