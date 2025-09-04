import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import AdminLayout from "../layouts/AdminLayout";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/admin/Users";
import Roles from "../pages/admin/Roles";
import RolePermissions from "../pages/admin/RolePermissions";
import NotFound from "../pages/NotFound";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import { LoadingSpinner } from "../components/ui";

function AppRouter() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner className="h-screen" />;
  }

  console.log('AppRouter - Auth state:', auth);
  console.log('AppRouter - Loading state:', loading);

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
            {/* Ruta simple para testing */}
            <Route path="/test" element={<div>Test Page - Usuario autenticado</div>} />
            
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard sin protección temporalmente */}
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route 
                path="configuracion/usuarios" 
                element={<Users />}
              />
              
              <Route 
                path="configuracion/roles" 
                element={<Roles />}
              />
              
              <Route 
                path="configuracion/roles/:id/permisos" 
                element={<RolePermissions />}
              />
            </Route>
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<div>Página no encontrada - Usuario autenticado</div>} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
