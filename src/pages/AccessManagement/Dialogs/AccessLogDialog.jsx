import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const AccessLogDialog = ({ open, onClose, onSave, data, isEdit }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Cập nhật thông tin vào ra" : "Thêm lượt vào ra mới"}
      </DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Họ và tên"
                defaultValue={data?.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Thiết bị / Vị trí"
                defaultValue={data?.device || "Gate 01"}
              >
                <MenuItem value="Gate 01">Cổng chính (Gate 01)</MenuItem>
                <MenuItem value="Office 02">Văn phòng (Office 02)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Phương thức"
                defaultValue={data?.method || "Vân tay"}
              >
                <MenuItem value="Vân tay">Vân tay</MenuItem>
                <MenuItem value="FaceID">FaceID</MenuItem>
                <MenuItem value="Thẻ từ">Thẻ từ</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <DateTimePicker
                label="Thời gian vào/ra"
                defaultValue={data?.time ? dayjs(data.time) : dayjs()}
                renderInput={(params) => <TextField {...params} fullWidth />}
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSave} color="primary">
          Xác nhận Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessLogDialog;
