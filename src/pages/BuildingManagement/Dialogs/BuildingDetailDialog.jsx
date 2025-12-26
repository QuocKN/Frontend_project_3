import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
} from "@mui/material";
import { Devices, Group, Info } from "@mui/icons-material";

const AreaDetailDialog = ({ open, onClose, area }) => {
  const [tab, setTab] = React.useState(0);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Thông tin chi tiết: {area?.name}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 400 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab icon={<Info />} label="Thông tin chung" />
          <Tab icon={<Devices />} label="Thiết bị (3)" />
          <Tab icon={<Group />} label="Người vào ra" />
        </Tabs>

        {tab === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1">
              <strong>Mô tả:</strong> {area?.description || "Không có mô tả"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Vị trí:</strong> {area?.location}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Ngày tạo:</strong> 15/12/2025
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <List>
            {[
              "Máy quét vân tay T1",
              "Camera AI Cổng",
              "Cảm biến hồng ngoại",
            ].map((dev) => (
              <ListItem key={dev}>
                <ListItemIcon>
                  <Devices />
                </ListItemIcon>
                <ListItemText primary={dev} secondary="Trạng thái: Online" />
                <Chip label="Đang hoạt động" color="success" size="small" />
              </ListItem>
            ))}
          </List>
        )}

        {tab === 2 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Danh sách những người có quyền truy cập vào tòa nhà này sẽ hiển thị
            tại đây...
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AreaDetailDialog;
