import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import toast from "react-hot-toast";

const FloorFormDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [formData, setFormData] = useState({
    floorNumber: 0,
    code: "",
    name: "",
    status: "ACTIVE",
    note: "",
  });

  useEffect(() => {
    if (data && isEdit) {
      setFormData({
        floorNumber: data.floorNumber ?? 0,
        code: data.code || "",
        name: data.name || "",
        status: data.status || "ACTIVE",
        note: data.note || "",
      });
    } else {
      setFormData({
        floorNumber: 0,
        code: "",
        name: "",
        status: "ACTIVE",
        note: "",
      });
    }
  }, [data, isEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng nhập Mã tầng và Tên tầng!");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Cập nhật tầng" : "Thêm tầng mới"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="code"
              label="Mã tầng"
              value={formData.code}
              onChange={handleChange}
              size="small"
              placeholder="VD: F01, B1"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="number"
              name="floorNumber"
              label="Số tầng (Number)"
              value={formData.floorNumber}
              onChange={handleChange}
              size="small"
              helperText="Dùng để sắp xếp (VD: -1, 0, 1)"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              required
              name="name"
              label="Tên tầng"
              value={formData.name}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Trạng thái"
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="LOCKED">Khóa</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="note"
              label="Ghi chú"
              value={formData.note}
              onChange={handleChange}
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FloorFormDialog;
