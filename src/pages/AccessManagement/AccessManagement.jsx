import React, { useState } from "react";
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
import { Add, Edit, Delete, FilterList, Download } from "@mui/icons-material";
import AccessLogDialog from "./Dialogs/AccessLogDialog";

// Component hiển thị STT không thay đổi khi sort
const RenderSTT = (params) => {
  const apiRef = useGridApiContext();
  const sortedRowIds = useGridSelector(apiRef, gridSortedRowIdsSelector);
  return sortedRowIds.indexOf(params.id) + 1;
};

const AccessManagement = () => {
  const [rows, setRows] = useState([
    {
      id: 101,
      name: "Nguyễn Văn A",
      time: "2024-03-20 08:15:00",
      device: "Gate 01",
      method: "Vân tay",
      type: "Vào",
    },
    {
      id: 102,
      name: "Trần Thị B",
      time: "2024-03-20 08:20:12",
      device: "Gate 01",
      method: "FaceID",
      type: "Vào",
    },
    {
      id: 103,
      name: "Lê Văn C",
      time: "2024-03-20 17:30:45",
      device: "Office 02",
      method: "Thẻ từ",
      type: "Ra",
    },
  ]);

  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 60,
      renderCell: RenderSTT,
      sortable: false,
    },
    { field: "name", headerName: "Họ và tên", flex: 1.5 },
    { field: "time", headerName: "Thời gian", flex: 1.2 },
    { field: "device", headerName: "Vị trí", flex: 1 },
    {
      field: "type",
      headerName: "Loại",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "Vào" ? "success" : "warning"}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: "method", headerName: "Phương thức", flex: 1 },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Cập nhật">
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
    <Box sx={{ p: 3 }}>
      {/* Header Area */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Lịch sử vào ra
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi lịch sử truy cập hệ thống thời gian thực
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Xuất báo cáo
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialog({ open: true, isEdit: false, data: null })}
          >
            Thêm lượt vào ra
          </Button>
        </Stack>
      </Stack>

      {/* Main Table */}
      <Paper
        sx={{
          height: 600,
          width: "100%",
          boxShadow: 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#f1f5f9",
              fontWeight: "bold",
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
