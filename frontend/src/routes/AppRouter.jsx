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
import UnidadesMedida from "../pages/admin/UnidadesMedida";
import Categories from "../pages/Categories";
import Items from "../pages/Items";
import ItemDetails from "../pages/ItemDetails";
import Bodegas from "../pages/Bodegas";
import BodegaDetails from "../pages/BodegaDetails";
import ConfigurarParametrosStock from "../pages/ConfigurarParametrosStock";
import ResumenBodegas from "../pages/ResumenBodegas";
import ExistenciasBodegas from "../pages/ExistenciasBodegas";
import MovimientosBodegas from "../pages/MovimientosBodegas";
import CrearMovimiento from "../pages/CrearMovimiento";
import ResumenMovimiento from "../pages/ResumenMovimiento";
import RequerimientosBodegas from "../pages/RequerimientosBodegas";
import TodosRequerimientos from "../pages/TodosRequerimientos";
import RequerimientosAprobados from "../pages/RequerimientosAprobados";
import RequerimientosPendientes from "../pages/RequerimientosPendientes";
import MisRequerimientos from "../pages/MisRequerimientos";
import RequerimientoDetalle from "../pages/RequerimientoDetalle";
import RequerimientoDetalleDespacho from "../pages/RequerimientoDetalleDespacho";
import CrearRequerimiento from "../pages/CrearRequerimiento";
import RegistroIncidencias from "../pages/RegistroIncidencias";
import NotFound from "../pages/NotFound";
import AccessDenied from "../pages/AccessDenied";
import ServerError from "../pages/ServerError";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import { LoadingSpinner } from "../components/ui";

function AppRouter() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner className="h-screen" />;
  }

  return (
    <ErrorBoundary>
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
                
                <Route 
                  path="configuracion/unidades-medida" 
                  element={<UnidadesMedida />}
                />
                
                <Route 
                  path="configuracion/bodegas" 
                  element={<Bodegas />}
                />
                
                <Route 
                  path="configuracion/bodegas/:id/detalles" 
                  element={<BodegaDetails />}
                />
                
                <Route 
                  path="configuracion/bodegas/:id/parametros" 
                  element={<ConfigurarParametrosStock />}
                />
                
                {/* Rutas operacionales de Bodegas */}
                <Route 
                  path="bodegas/resumen" 
                  element={<ResumenBodegas />}
                />
                
                <Route 
                  path="bodegas/existencias" 
                  element={<ExistenciasBodegas />}
                />
                
                <Route 
                  path="bodegas/movimientos" 
                  element={<MovimientosBodegas />}
                />
                
                <Route 
                  path="bodegas/movimientos/crear/:tipo" 
                  element={<CrearMovimiento />}
                />
                
                <Route 
                  path="bodegas/movimientos/resumen" 
                  element={<ResumenMovimiento />}
                />
                
                <Route 
                  path="bodegas/requerimientos" 
                  element={<RequerimientosBodegas />}
                />
                
                <Route 
                  path="bodegas/requerimientos/todos" 
                  element={<TodosRequerimientos />}
                />
                
                <Route 
                  path="bodegas/requerimientos/pendientes" 
                  element={<RequerimientosPendientes />}
                />
                
                <Route 
                  path="bodegas/requerimientos/aprobados" 
                  element={<RequerimientosAprobados />}
                />
                
                <Route 
                  path="requerimientos/:id/despacho" 
                  element={<RequerimientoDetalleDespacho />}
                />
                
                <Route 
                  path="mis-requerimientos" 
                  element={<MisRequerimientos />}
                />
                
                <Route 
                  path="requerimientos/crear" 
                  element={<CrearRequerimiento />}
                />
                
                <Route 
                  path="requerimientos/:id" 
                  element={<RequerimientoDetalle />}
                />
                
                <Route 
                  path="incidencias" 
                  element={<RegistroIncidencias />}
                />
                
                <Route 
                  path="inventario/categorias" 
                  element={<Categories />}
                />
                
                <Route 
                  path="inventario/items" 
                  element={<Items />}
                />
                
                <Route 
                  path="inventario/items/:id/detalles" 
                  element={<ItemDetails />}
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
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default AppRouter;
