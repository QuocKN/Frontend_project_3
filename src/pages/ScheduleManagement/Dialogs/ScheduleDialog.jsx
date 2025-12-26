import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const ScheduleDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [form, setForm] = useState({
    employee: "",
    area: "",
    start: dayjs(),
    end: dayjs(),
    note: "",
  });

  /* ===== Khi mở dialog: set data ===== */
  useEffect(() => {
    if (open) {
      if (isEdit && data) {
        // Parse ngày giờ từ data của backend (specificDate + startTime/endTime)
        // Nếu là lịch định kỳ (specificDate null), tạm lấy ngày hiện tại để hiển thị giờ
        const dateStr = data.specificDate || dayjs().format("YYYY-MM-DD");
        const startDateTime = dayjs(`${dateStr}T${data.startTime}`);
        const endDateTime = dayjs(`${dateStr}T${data.endTime}`);

        setForm({
          employee: data.employee?.employeeCode || "",
          area: data.room?.code || "", // Lấy code thay vì id để phù hợp với findByCode
          start: startDateTime,
          end: endDateTime,
          note: "", // Backend hiện chưa có trường note, để trống
        });
      } else {
        setForm({
          employee: "",
          area: "",
          start: dayjs(),
          end: dayjs().add(1, "hour"), // Mặc định kết thúc sau 1 tiếng
          note: "",
        });
      }
    }
  }, [open, data, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Cập nhật lịch làm việc" : "Tạo lịch làm việc mới"}
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* ===== Nhân sự ===== */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã nhân viên"
                value={form.employee}
                onChange={(e) => handleChange("employee", e.target.value)}
              />
            </Grid>

            {/* ===== Khu vực ===== */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã phòng (Code)"
                value={form.area}
                onChange={(e) => handleChange("area", e.target.value)}
              />
            </Grid>

            {/* ===== Thời gian ===== */}
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Bắt đầu"
                value={form.start}
                onChange={(v) => handleChange("start", v)}
                sx={{ width: "100%" }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Kết thúc"
                value={form.end}
                onChange={(v) => handleChange("end", v)}
                sx={{ width: "100%" }}
              />
            </Grid>

            {/* ===== Ghi chú ===== */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú / Nội dung công việc"
                multiline
                rows={2}
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>
          Lưu lịch trình
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleDialog;
