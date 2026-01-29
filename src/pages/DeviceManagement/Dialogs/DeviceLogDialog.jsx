import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../../apis/api";
import { toast } from "react-hot-toast";

const DeviceLogDialog = ({ open, onClose, device }) => {
  const [logRows, setLogRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  useEffect(() => {
    if (open && device?.deviceId) {
      const fetchLogs = async () => {
        setLoading(true);
        try {
          const res = await api.get(
            `/checkin/get-access-logs/${device.deviceId}`
          );
          const logs = Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : [];

          // Get unique room IDs
          const uniqueRoomIds = [
            ...new Set(
              logs.map((log) => log.device?.room?.id).filter((id) => id != null)
            ),
          ];

          // Fetch building info for each room
          const buildingMap = {};
          await Promise.all(
            uniqueRoomIds.map(async (roomId) => {
              try {
                const buildingRes = await api.get(`/buildings/room/${roomId}`);
                buildingMap[roomId] =
                  buildingRes.data?.data?.name ||
                  buildingRes.data?.name ||
                  "N/A";
              } catch (error) {
                buildingMap[roomId] = "N/A";
              }
            })
          );

          const normalized = logs.map((log, index) => ({
            id: log.id || index,
            time: log.timestamp ? log.timestamp.split(".")[0] : "N/A",
            employeeName: log.employee?.fullName || "N/A",
            employeeCode: log.employee?.employeeCode || "N/A",
            buildingName: buildingMap[log.device?.room?.id] || "N/A",
            roomName: log.device?.room?.name || "N/A",
            method: log.method || "N/A",
            status: log.status ? "Thành công" : "Thất bại",
            faceImage: log.faceImage || null,
          }));

          setLogRows(normalized);
        } catch (e) {
          const msg = e?.response?.data?.message || "Lỗi khi tải log";
          toast.error(msg);
          setLogRows([]);
        } finally {
          setLoading(false);
        }
      };
      fetchLogs();
    }
  }, [open, device]);

  const handleImageClick = (imageBase64) => {
    setSelectedImage(imageBase64);
    setImageDialogOpen(true);
  };

  const handleImageDialogClose = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  const columns = [
    { field: "time", headerName: "Thời gian", width: 180 },
    { field: "employeeName", headerName: "Tên nhân viên", width: 180 },
    { field: "employeeCode", headerName: "Mã NV", width: 100 },
    { field: "buildingName", headerName: "Tòa nhà", width: 150 },
    { field: "roomName", headerName: "Phòng", width: 150 },
    {
      field: "method",
      headerName: "Phương thức",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={params.value === "FACE" ? "primary" : "default"}
        />
      ),
    },
    {
      field: "status",
      headerName: "Trạng thái",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === "Thành công" ? "success" : "error"}
        />
      ),
    },
    {
      field: "faceImage",
      headerName: "Ảnh khuôn mặt",
      width: 120,
      renderCell: (params) =>
        params.value ? (
          <img
            src={`data:image/jpeg;base64,${params.value}`}
            alt="Face"
            onClick={() => handleImageClick(params.value)}
            style={{
              width: 50,
              height: 50,
              objectFit: "cover",
              borderRadius: 4,
              cursor: "pointer",
            }}
          />
        ) : (
          <Typography variant="caption" color="textSecondary">
            N/A
          </Typography>
        ),
    },
  ];

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle>
          Lịch sử hoạt động:{" "}
          <Typography component="span" fontWeight="bold" color="primary">
            {device?.name}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: 400, width: "100%" }}>
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100%"
              >
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={logRows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleImageDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ảnh khuôn mặt</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            {selectedImage && (
              <img
                src={`data:image/jpeg;base64,${selectedImage}`}
                alt="Face Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageDialogClose} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeviceLogDialog;
