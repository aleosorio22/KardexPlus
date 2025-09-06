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
import SystemSetup from "../pages/admin/SystemSetup";
import Categories from "../pages/Categories";
import NotFound from "../pages/NotFound";
import AccessDenied from "../pages/AccessDenied";
import ServerError from "../pages/ServerError";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import { LoadingSpinner } from "../components/ui";

// Componente interno que usa useAuth DENTRO del BrowserRouter
function AppContent() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-screen" />
      </div>
    );
  }

  console.log('AppRouter - Auth state:', auth);
  console.log('AppRouter - Loading state:', loading);

  return (
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
            
            <Route 
              path="inventario/categorias" 
              element={<Categories />}
            />
            
            <Route 
              path="configuracion/sistema" 
              element={<SystemSetup />}
            />
            
            {/* Ruta catch-all dentro del layout para páginas no encontradas */}
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Ruta independiente para 404 (fuera del layout) */}
          <Route path="/404" element={<NotFound />} />
          
          {/* Ruta independiente para 403 (fuera del layout) */}
          <Route path="/403" element={<AccessDenied />} />
          
          {/* Ruta independiente para 500 (fuera del layout) */}
          <Route path="/500" element={<ServerError />} />
        </>
      )}
    </Routes>
  );
}

function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default AppRouter;
