import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import api from "../../../apis/api";

const DeviceDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [form, setForm] = useState({
    deviceId: "",
    name: "",
    location: "",
    roomCode: "",
    status: "Offline",
  });
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Đồng bộ form khi mở dialog sửa
  // Load rooms when dialog opens
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/rooms");
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        setRooms(list);
      } catch (e) {
        setRooms([]);
      }
    };
    if (open) fetchRooms();
  }, [open]);

  useEffect(() => {
    if (data) {
      const initial = {
        deviceId: data.deviceId || "",
        name: data.name || "",
        location: data.location || "",
        roomCode: data.roomCode || data.room?.code || data.room?.roomCode || "",
        status: data.status || "Offline",
      };
      setForm(initial);
      // Map selected room by code if available
      const code = initial.roomCode;
      if (code && rooms.length) {
        const match = rooms.find((r) => r.code === code || r.roomCode === code);
        setSelectedRoom(match || null);
      } else {
        setSelectedRoom(null);
      }
    } else {
      setForm({
        deviceId: "",
        name: "",
        location: "",
        roomCode: "",
        status: "Offline",
      });
      setSelectedRoom(null);
    }
  }, [data, open, rooms]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isEdit ? "Cấu hình thiết bị" : "Đăng ký thiết bị mới"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="deviceId"
              label="Mã định danh (deviceId)"
              value={form.deviceId}
              onChange={handleChange}
              disabled={isEdit} // Thường ID không cho sửa
              placeholder="Ví dụ: B1-101"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="name"
              label="Tên thiết bị"
              value={form.name}
              onChange={handleChange}
              placeholder="Ví dụ: Cổng chính Tầng 1"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="location"
              label="Mô tả vị trí"
              value={form.location}
              onChange={handleChange}
              placeholder="Ví dụ: Tòa nhà B1, Đại học Bách Khoa"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={rooms}
              getOptionLabel={(opt) =>
                opt?.code ||
                opt?.roomCode ||
                opt?.name ||
                (opt?.id ? `Phòng ${opt.id}` : "")
              }
              value={selectedRoom}
              onChange={(_, newVal) => {
                setSelectedRoom(newVal);
                setForm((prev) => ({
                  ...prev,
                  roomCode: newVal?.code || newVal?.roomCode || "",
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Phòng (roomCode)"
                  placeholder="Chọn phòng"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              name="status"
              label="Trạng thái"
              value={form.status}
              onChange={handleChange}
            >
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Offline">Offline</MenuItem>
              <MenuItem value="Unknown">Unknown</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSave(form)}>
          Lưu dữ liệu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeviceDialog;
