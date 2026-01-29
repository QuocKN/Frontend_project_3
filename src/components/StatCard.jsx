import { Card, CardContent, Typography, Box, Stack } from "@mui/material";

const StatCard = ({ title, value, icon, color, onClick }) => {
  return (
    <Card
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: 6,
            }
          : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              p: 1.5,
              borderRadius: 2,
              display: "flex",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatCard;
