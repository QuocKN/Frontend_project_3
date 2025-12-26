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
    employeeCode: "",
    fullName: "",
    department: "",
    status: true,
  });

  useEffect(() => {
    if (data && isEdit) {
      setFormData({
        employeeCode: data.employeeCode || "",
        fullName: data.fullName || "",
        department: data.department || "",
        status: data.status !== undefined ? data.status : true,
      });
    } else {
      setFormData({
        employeeCode: "",
        fullName: "",
        department: "",
        status: true,
      });
    }
  }, [data, isEdit, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.employeeCode.trim() || !formData.fullName.trim()) {
      toast.error("Vui lòng nhập Mã người vào ra và Họ tên!");
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
              name="employeeCode"
              label="Mã người vào ra"
              value={formData.employeeCode}
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
