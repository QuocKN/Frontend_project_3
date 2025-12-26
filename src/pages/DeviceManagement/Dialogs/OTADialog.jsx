import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  LinearProgress,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const OTADialog = ({ open, onClose, device }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cập nhật Firmware (OTA)</DialogTitle>
      <DialogContent dividers sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Thiết bị: <strong>{device?.name}</strong>
        </Typography>
        <Box sx={{ border: "2px dashed #ccc", p: 3, borderRadius: 2, mb: 2 }}>
          <CloudUpload sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
          <Typography variant="caption" display="block">
            Kéo thả file .bin vào đây hoặc
          </Typography>
          <Button size="small" component="label">
            {" "}
            Chọn file <input type="file" hidden />{" "}
          </Button>
        </Box>
        {/* Giả lập thanh tiến trình cập nhật */}
        <Box sx={{ width: "100%", mt: 2 }}>
          <Typography variant="caption">Tiến độ: 0%</Typography>
          <LinearProgress variant="determinate" value={0} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OTADialog;
