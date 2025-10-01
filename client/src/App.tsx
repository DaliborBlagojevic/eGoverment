import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLanding from "./pages/AdminLanding";
import AdminLayout from "./pages/admin/AdminLayout";
import StudentsPage from "./pages/admin/StudentsPage";
import DormsPage from "./pages/admin/DormsPage";
import RoomsPage from "./pages/admin/RoomsPage";
import ApplicationsPage from "./pages/admin/ApplicationsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import HomePage from "./pages/HomePage";
import NewRegisterPage from "./pages/RegisterPage";

import ForbiddenPage from "./pages/ForbiddenPage";
import { GuestOnly, RequireAuth, RequireRole } from "./auth/routeGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public ili privatno po potrebi */}
        <Route path="/" element={<AdminLanding />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <AdminLanding />
            </RequireAuth>
          }
        />

        {/* Guest-only rute */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <HomePage />
            </GuestOnly>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnly>
              <NewRegisterPage />
            </GuestOnly>
          }
        />

        {/* Protected (role-based) admin sekcija */}
        <Route
          path="/admin"
          element={
            <RequireRole allow={["ADMIN", "STAFF"]}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<Navigate to="dorms" replace />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="dorms" element={<DormsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
