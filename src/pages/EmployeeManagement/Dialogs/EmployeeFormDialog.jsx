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

const EmployeeFormDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    department: "",
    status: true,
    identificationCode: "", // Keep other fields
  });

  useEffect(() => {
    if (data && isEdit) {
      setFormData({
        fullName: data.fullName || "",
        department: data.department || "",
        employeeCode: data.employeeCode || "",
        status: data.status !== undefined ? data.status : true,
        identificationCode: data.identificationCode || "", // Keep other fields
      });
    } else {
      setFormData({
        fullName: "",
        department: "",
        employeeCode: "",
        status: true,
        identificationCode: "", // Keep other fields
      });
    }
  }, [data, isEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.identificationCode.trim() || !formData.fullName.trim()) {
      toast.error("Vui lòng nhập Mã định danh cá nhân và Họ tên!");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Cập nhật người vào ra" : "Thêm người vào ra mới"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="identificationCode"
              label="CCCD/Hộ chiếu"
              value={formData.identificationCode}
              onChange={handleChange}
              disabled={isEdit} // Không cho sửa ID khi update
              size="small"
              placeholder="VD: NV001"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="fullName"
              label="Họ và tên"
              value={formData.fullName}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              name="department"
              label="Phòng ban"
              value={formData.department}
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
                <MenuItem value={true}>Hoạt động</MenuItem>
                <MenuItem value={false}>Ngưng hoạt động</MenuItem>
              </Select>
            </FormControl>
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

export default EmployeeFormDialog;
