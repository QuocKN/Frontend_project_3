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
import { DataGrid, gridSortedRowIdsSelector } from "@mui/x-data-grid";
import {
  Add,
  Edit,
  Delete,
  History,
  SystemUpdateAlt,
  Router,
} from "@mui/icons-material";
import DeviceDialog from "./Dialogs/DeviceDialog";
import api from "../../apis/api";
import { toast } from "react-hot-toast";

const formatHeartbeat = (ts) => {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  } catch {
    return String(ts);
  }
};

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [dialog, setDialog] = useState({
    open: false,
    isEdit: false,
    data: null,
  });

  // Tải danh sách thiết bị từ API
  useEffect(() => {
    let mounted = true;
    const fetchDevices = async () => {
      try {
        const res = await api.get("/devices");
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const normalized = list.map((d) => ({
          ...d,
          id: d?.id ?? d?.deviceId,
        }));
        if (mounted) setDevices(normalized);
      } catch (e) {
        // ignore
      }
    };
    fetchDevices();
    return () => {
      mounted = false;
    };
  }, []);

  const columns = [
    {
      field: "stt",
      headerName: "STT",
      width: 60,
      sortable: false,
      renderCell: (params) => {
        const sortedIds = gridSortedRowIdsSelector(params.api.state);
        return sortedIds.indexOf(params.id) + 1;
      },
    },
    { field: "name", headerName: "Tên thiết bị", flex: 1 },
    { field: "location", headerName: "Vị trí", flex: 1 },
    {
      field: "roomCode",
      headerName: "Phòng",
      width: 160,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || "N/A"}
          size="small"
          color={params.value === "Online" ? "success" : "error"}
          icon={<Router fontSize="small" />}
        />
      ),
    },
    {
      field: "lastHeartbeat",
      headerName: "Ping cuối",
      width: 160,
      valueFormatter: (params) => formatHeartbeat(params?.value),
    },
    {
      field: "actions",
      headerName: "Thao tác",
      width: 200,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Sửa cấu hình">
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
          <Tooltip title="Xem Log">
            <IconButton size="small" color="info">
              <History fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="OTA Firmware">
            <IconButton size="small" color="secondary">
              <SystemUpdateAlt fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={async () => {
                const deviceId = params?.row?.deviceId;
                console.log("ihi", params.row);
                if (!deviceId) return;
                const deviceName = params?.row?.name || deviceId;
                const ok = window.confirm(
                  `Bạn có chắc muốn xóa thiết bị "${deviceName}"?`
                );
                if (!ok) return;
                try {
                  await api.delete(`/devices/${deviceId}`);
                  toast.success("Đã xóa thiết bị");
                } catch (e) {
                  const msg =
                    e?.response?.data?.message || "Xóa thiết bị thất bại";
                  toast.error(msg);
                } finally {
                  setDevices((prev) =>
                    prev.filter((d) => d.deviceId !== deviceId)
                  );
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
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Thiết bị
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialog({ open: true, isEdit: false, data: null })}
        >
          Đăng ký thiết bị
        </Button>
      </Stack>

      <Paper sx={{ height: 500, width: "100%", boxShadow: 3 }}>
        <DataGrid
          rows={devices}
          columns={columns}
          getRowId={(row) => row?.id ?? row?.deviceId}
          disableSelectionOnClick
        />
      </Paper>

      <DeviceDialog
        open={dialog.open}
        isEdit={dialog.isEdit}
        data={dialog.data}
        onClose={() => setDialog({ ...dialog, open: false })}
        onSave={async (formData) => {
          try {
            if (dialog.isEdit && dialog.data?.id) {
              const res = await api.put(`/devices/${dialog.data.id}`, formData);
              const updated = res.data?.data || res.data;
              if (!updated) {
                toast.error("Cập nhật thiết bị thất bại");
                return;
              }
              const updatedWithId = {
                ...updated,
                id: updated.id ?? updated.deviceId ?? dialog.data.id,
              };
              setDevices((prev) =>
                prev.map((d) =>
                  d.id === dialog.data.id ? { ...d, ...updatedWithId } : d
                )
              );
              toast.success("Đã cập nhật thiết bị");
            } else {
              const res = await api.post("/devices", formData);
              const created = res.data?.data || res.data;
              if (!created) {
                toast.error("Tạo thiết bị thất bại");
                return;
              }
              const createdWithId = {
                ...created,
                id: created.id ?? created.deviceId,
              };
              setDevices((prev) => [...prev, createdWithId]);
              toast.success("Đã tạo thiết bị");
            }
          } catch (e) {
            const errorMessage =
              e?.response?.data?.message || "Lỗi khi lưu thiết bị";
            toast.error(errorMessage);
          } finally {
            setDialog({ ...dialog, open: false });
          }
        }}
      />
    </Box>
  );
};

export default DeviceManagement;
