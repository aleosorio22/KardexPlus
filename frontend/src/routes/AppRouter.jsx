import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import AdminLayout from "../layouts/AdminLayout";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/admin/Users";
import NotFound from "../pages/NotFound";

// UI Components
import { LoadingSpinner } from "../components/ui";

function AppRouter() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {!auth ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="configuracion/usuarios" element={<Users />} />
            </Route>
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
