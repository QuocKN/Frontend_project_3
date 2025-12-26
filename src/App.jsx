import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Biometrics from "./pages/Biometrics/Biometrics";
import DeviceManagement from "./pages/DeviceManagement/DeviceManagement";
import AccessManagement from "./pages/AccessManagement/AccessManagement";
import BuildingManagement from "./pages/BuildingManagement/BuildingManagement";
import ScheduleManagement from "./pages/ScheduleManagement/ScheduleManagement";
import Register from "./pages/Login/Register";
import Login from "./pages/Login/Login";
import RequireAuth from "./components/RequireAuth";
import { Toaster } from "react-hot-toast";
import EmployeeManagement from "./pages/EmployeeManagement/EmployeeManagement";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          // Bạn có thể cấu hình thêm style mặc định ở đây
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <Routes>
        {/* Các trang cần đăng nhập */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<MainLayout />}>
            {/* Mặc định khi vào trang chủ sẽ hiện Dashboard */}
            <Route index element={<Dashboard />} />
            {/* Các route tương ứng với sơ đồ Use Case */}
            <Route path="biometrics" element={<Biometrics />} />
            <Route path="devices" element={<DeviceManagement />} />
            <Route path="attendance" element={<AccessManagement />} />
            <Route path="buildings" element={<BuildingManagement />} />
            <Route path="schedules" element={<ScheduleManagement />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="reports" element={<Dashboard />} />{" "}
            {/* Dùng chung Dashboard cho báo cáo */}
            {/* Route bắt lỗi 404 - quay về Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
        {/* Trang Auth hiển thị riêng, không dùng MainLayout */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
