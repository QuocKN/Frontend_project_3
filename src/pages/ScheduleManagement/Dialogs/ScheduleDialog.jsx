import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Menu,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const ScheduleDialog = ({ open, onClose, onSave, data, isEdit }) => {
  const [form, setForm] = useState({
    employee: "",
    area: "",
    startTime: dayjs(),
    endTime: dayjs(),
    note: "",
    weekday: "", // Add weekday field
    specificDate: dayjs(), // Add specificDate field
    effectiveFrom: dayjs(), // Ngày bắt đầu hiệu lực cho lịch weekday
    effectiveTo: null, // Ngày kết thúc hiệu lực (optional)
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
          startTime: startDateTime,
          endTime: endDateTime,
          note: "", // Backend hiện chưa có trường note, để trống
          weekday: data.weekday || "", // Thêm trường weekday
          specificDate: data.specificDate ? dayjs(data.specificDate) : dayjs(), // Thêm trường specificDate
          effectiveFrom: data.effectiveFrom
            ? dayjs(data.effectiveFrom)
            : dayjs(),
          effectiveTo: data.effectiveTo ? dayjs(data.effectiveTo) : null,
        });
      } else {
        setForm({
          employee: "",
          area: "",
          startTime: dayjs(),
          endTime: dayjs().add(1, "hour"), // Mặc định kết thúc sau 1 tiếng
          note: "",
          weekday: "", // Đặt lại trường weekday
          specificDate: dayjs(), // Đặt lại trường specificDate
          effectiveFrom: dayjs(),
          effectiveTo: null,
        });
      }
    }
  }, [open, data, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = {
      ...form,
      specificDate: form.weekday
        ? null
        : form.specificDate.format("YYYY-MM-DD"),
      weekday: form.weekday || null,
      effectiveFrom:
        form.weekday && form.effectiveFrom
          ? form.effectiveFrom.format("YYYY-MM-DD")
          : null,
      effectiveTo:
        form.weekday && form.effectiveTo
          ? form.effectiveTo.format("YYYY-MM-DD")
          : null,
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false}>
      <DialogTitle>
        {isEdit ? "Cập nhật lịch làm việc" : "Tạo lịch làm việc mới"}
      </DialogTitle>

      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid
            container
            spacing={2.5}
            sx={{ width: "fit-content", maxWidth: 470 }}
          >
            {/* ===== Nhân sự & Khu vực ===== */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã nhân viên"
                value={form.employee}
                onChange={(e) => handleChange("employee", e.target.value)}
                size="small"
                sx={{ width: 222 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mã phòng (Code)"
                value={form.area}
                onChange={(e) => handleChange("area", e.target.value)}
                size="small"
                sx={{ width: 222 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl size="small" sx={{ width: 222 }}>
                <InputLabel>Thứ trong tuần</InputLabel>
                <Select
                  value={form.weekday}
                  label="Thứ trong tuần"
                  onChange={(e) => {
                    handleChange("weekday", e.target.value);
                    if (e.target.value) {
                      handleChange("specificDate", null);
                    }
                  }}
                >
                  <MenuItem value="">Không chọn</MenuItem>
                  <MenuItem value="MONDAY">Thứ Hai</MenuItem>
                  <MenuItem value="TUESDAY">Thứ Ba</MenuItem>
                  <MenuItem value="WEDNESDAY">Thứ Tư</MenuItem>
                  <MenuItem value="THURSDAY">Thứ Năm</MenuItem>
                  <MenuItem value="FRIDAY">Thứ Sáu</MenuItem>
                  <MenuItem value="SATURDAY">Thứ Bảy</MenuItem>
                  <MenuItem value="SUNDAY">Chủ Nhật</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Ngày cụ thể"
                value={form.specificDate}
                onChange={(v) => handleChange("specificDate", v)}
                disabled={!!form.weekday}
                slotProps={{ textField: { size: "small", sx: { width: 222 } } }}
              />
            </Grid>

            {/* ===== Ngày hiệu lực (chỉ cho weekday) ===== */}
            {form.weekday && (
              <>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Ngày bắt đầu hiệu lực *"
                    value={form.effectiveFrom}
                    onChange={(v) => handleChange("effectiveFrom", v)}
                    slotProps={{
                      textField: { size: "small", sx: { width: 222 } },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Ngày kết thúc hiệu lực"
                    value={form.effectiveTo}
                    onChange={(v) => handleChange("effectiveTo", v)}
                    minDate={form.effectiveFrom}
                    slotProps={{
                      textField: { size: "small", sx: { width: 222 } },
                    }}
                  />
                </Grid>
              </>
            )}

            {/* ===== Thời gian ===== */}
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Thời gian bắt đầu"
                value={form.startTime}
                onChange={(v) => handleChange("startTime", v)}
                slotProps={{ textField: { size: "small", sx: { width: 222 } } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Thời gian kết thúc"
                value={form.endTime}
                onChange={(v) => handleChange("endTime", v)}
                slotProps={{ textField: { size: "small", sx: { width: 222 } } }}
              />
            </Grid>
            {/* ===== Thứ trong tuần & Ngày cụ thể ===== */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ py: 0.5 }}>
                Chỉ chọn <strong>Thứ trong tuần</strong> hoặc{" "}
                <strong>Ngày cụ thể</strong>, không chọn cả hai.
                {form.weekday && (
                  <>
                    <br />
                    <strong>Lịch định kỳ</strong> cần nhập{" "}
                    <strong>Ngày bắt đầu hiệu lực</strong>.
                  </>
                )}
              </Alert>
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
