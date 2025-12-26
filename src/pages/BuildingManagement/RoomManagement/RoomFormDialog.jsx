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

const RoomFormDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    status: "ACTIVE",
    note: "",
    description: "",
  });

  useEffect(() => {
    if (data && isEdit) {
      setFormData({
        code: data.code || "",
        name: data.name || "",
        status: data.status || "ACTIVE",
        note: data.note || "",
        description: data.description || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        status: "ACTIVE",
        note: "",
        description: "",
      });
    }
  }, [data, isEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Vui lòng nhập Mã phòng và Tên phòng!");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Cập nhật phòng" : "Thêm phòng mới"}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="code"
              label="Mã phòng"
              value={formData.code}
              onChange={handleChange}
              size="small"
              placeholder="VD: P01"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="name"
              label="Tên phòng"
              value={formData.name}
              onChange={handleChange}
              size="small"
              placeholder="VD: P.402"
            />
          </Grid>

          <Grid item xs={12} sm={12}>
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
              name="description"
              label="Mô tả"
              value={formData.description}
              onChange={handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
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

export default RoomFormDialog;
