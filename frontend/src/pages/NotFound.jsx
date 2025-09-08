import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiAlertTriangle, FiSettings } from 'react-icons/fi';

const NotFound = () => {
  const location = useLocation();
  
  // Detectar si estamos dentro del dashboard (layout admin)
  const isInDashboard = location.pathname.startsWith('/dashboard') || 
                       location.pathname.startsWith('/configuracion');

  if (isInDashboard) {
    // Versión para mostrar dentro del AdminLayout
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-lg w-full text-center">
          {/* Icono principal */}
          <div className="mb-8">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            {/* Número 404 */}
            <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Página no encontrada
            </h2>
          </div>

          {/* Mensaje descriptivo */}
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              La página que estás buscando no existe en esta sección del sistema.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Ruta solicitada:</strong> {location.pathname}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
            >
              <FiHome size={18} />
              <span>Ir al Dashboard</span>
            </Link>
            
            <Link
              to="/dashboard/configuracion/usuarios"
              className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full"
            >
              <FiSettings size={18} />
              <span>Ir a Configuración</span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors w-full"
            >
              <FiArrowLeft size={18} />
              <span>Regresar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Versión completa para mostrar fuera del layout
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono principal */}
        <div className="mb-8">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          {/* Número 404 */}
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Página no encontrada
          </h2>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <div className="bg-white rounded-lg p-4 mb-4 border">
            <p className="text-sm text-gray-600">
              <strong>Ruta solicitada:</strong> {location.pathname}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Puedes regresar al dashboard o usar la navegación para encontrar lo que necesitas.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
          >
            <FiHome size={18} />
            <span>Ir al Dashboard</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors w-full"
          >
            <FiArrowLeft size={18} />
            <span>Regresar</span>
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Si crees que esto es un error, por favor contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
