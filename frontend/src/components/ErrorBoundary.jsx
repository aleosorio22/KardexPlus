import React from 'react';
import { FiRefreshCw, FiHome, FiAlertTriangle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registra el error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Icono principal */}
            <div className="mb-8">
              <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-800 mb-2">¡Oops!</h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Algo salió mal
              </h2>
            </div>

            {/* Mensaje descriptivo */}
            <div className="mb-8">
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado en la aplicación.
              </p>
              
              {/* Detalles del error (solo en desarrollo) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Detalles del error:</h3>
                  <p className="text-sm text-red-700 mb-2 font-mono">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-red-600">
                      <summary className="cursor-pointer hover:text-red-800">
                        Ver stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-40 bg-red-100 p-2 rounded">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-500">
                Puedes intentar recargar la página o regresar al dashboard.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full"
              >
                <FiRefreshCw size={18} />
                <span>Recargar página</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors w-full"
              >
                <FiHome size={18} />
                <span>Ir al Dashboard</span>
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Si el problema persiste, por favor contacta al administrador del sistema.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
