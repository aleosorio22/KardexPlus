import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiZap, FiRefreshCw } from 'react-icons/fi';

const ServerError = () => {
  const location = useLocation();
  
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono principal */}
        <div className="mb-8">
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <FiZap className="w-12 h-12 text-red-500" />
          </div>
          
          {/* Número 500 */}
          <h1 className="text-6xl font-bold text-gray-800 mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Error interno del servidor
          </h2>
        </div>

        {/* Mensaje descriptivo */}
        <div className="mb-8">
          <p className="text-gray-600 mb-4">
            Ha ocurrido un error interno en el servidor. Estamos trabajando para solucionarlo.
          </p>
          
          {location.state?.from && (
            <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
              <p className="text-sm text-gray-600">
                <strong>Error en:</strong> {location.state.from}
              </p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Por favor, intenta recargar la página o regresar al dashboard.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full"
          >
            <FiRefreshCw size={18} />
            <span>Recargar página</span>
          </button>
          
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
            Si el problema persiste, por favor contacta al administrador del sistema.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400 mt-2">
              ID de sesión: {Date.now().toString(36)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerError;
