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

const AreaFormDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    status: "active",
    description: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        code: data.code || "",
        name: data.name || "",
        address: data.address || "",
        status: data.status || "active",
        description: data.description || "",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        address: "",
        status: "active",
        description: "",
      });
    }
  }, [data, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Logic Validation: Kiểm tra require
    if (
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.address.trim()
    ) {
      toast.error("Vui lòng nhập đầy đủ Mã tòa nhà, Tên tòa nhà và Địa chỉ!");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Cập nhật tòa nhà" : "Thêm tòa nhà mới"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              name="code"
              label="Mã tòa nhà"
              value={formData.code}
              onChange={handleChange}
              error={!formData.code && open}
              helperText={
                !formData.code && open ? "Mã tòa nhà không được để trống" : ""
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              required
              name="name"
              label="Tên tòa nhà"
              value={formData.name}
              onChange={handleChange}
              error={!formData.name && open}
              helperText={
                !formData.name && open ? "Tên tòa nhà không được để trống" : ""
              }
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              required
              name="address"
              label="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
              error={!formData.address && open}
              helperText={
                !formData.address && open ? "Địa chỉ không được để trống" : ""
              }
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
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              label="Mô tả"
              value={formData.description}
              onChange={handleChange}
              size="small"
              placeholder="Nhập mô tả tòa nhà..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu thông tin
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaFormDialog;
