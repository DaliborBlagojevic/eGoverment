import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLanding from "./pages/AdminLanding";
import AdminLayout from "./pages/admin/AdminLayout";
import StudentsPage from "./pages/admin/StudentsPage";
import DormsPage from "./pages/admin/DormsPage";
import RoomsPage from "./pages/admin/RoomsPage";
import ApplicationsPage from "./pages/admin/ApplicationsPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import HomePage from "./pages/HomePage";


// Ako imaš zasebnu login rutu, ostavi je. Ovde je fokus na adminu.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<AdminLanding />} />
        <Route path="/login" element={<HomePage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dorms" replace />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="dorms" element={<DormsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
