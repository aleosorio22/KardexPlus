import { useNavigate, useLocation } from 'react-router-dom';

// Utilidad para manejar redirecciones a páginas de error
export const redirectToError = (errorCode, navigate, location) => {
  const errorPages = {
    400: '/400',
    401: '/login',
    403: '/403', 
    404: '/404',
    500: '/500'
  };

  const targetPath = errorPages[errorCode] || '/404';
  
  // Preservar información sobre la ruta original
  navigate(targetPath, { 
    state: { 
      from: location?.pathname || window.location.pathname,
      originalError: errorCode 
    },
    replace: true 
  });
};

// Hook para manejo centralizado de errores HTTP
export const useErrorHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleError = (error) => {
    console.error('Error handled:', error);
    
    if (error.response?.status) {
      redirectToError(error.response.status, navigate, location);
    } else if (error.status) {
      redirectToError(error.status, navigate, location);
    } else {
      // Error genérico - ir a 500
      redirectToError(500, navigate, location);
    }
  };

  return { handleError };
};

// Componente para mostrar errores inline
export const ErrorMessage = ({ 
  error, 
  onRetry = null, 
  className = '', 
  showDetails = false 
}) => {
  const getErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  };

  const getErrorCode = (error) => {
    return error?.response?.status || error?.status || 'ERROR';
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error {getErrorCode(error)}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {getErrorMessage(error)}
          </p>
          
          {showDetails && error?.response?.data && (
            <details className="mt-2">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                Ver detalles técnicos
              </summary>
              <pre className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                {JSON.stringify(error.response.data, null, 2)}
              </pre>
            </details>
          )}
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
