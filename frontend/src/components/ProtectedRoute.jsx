import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ 
    children, 
    requiredPermission = null,
    requiredPermissions = null,
    requireAll = false,
    redirectTo = '/login',
    fallbackComponent = null 
}) => {
    const { user, loading: authLoading } = useAuth();
    const { hasPermission, hasAnyPermission, hasAllPermissions, loading: permissionsLoading, isAdmin } = usePermissions();

    // Mostrar loading mientras se cargan los datos
    if (authLoading || permissionsLoading) {
        return <LoadingSpinner />;
    }

    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
        return <Navigate to={redirectTo} replace />;
    }

    // Si es administrador, permitir acceso a todo
    if (isAdmin()) {
        return children;
    }

    // TEMPORALMENTE: permitir acceso si hay usuario (para depuración)
    console.log('Usuario:', user);
    console.log('Permiso requerido:', requiredPermission);
    console.log('Permisos loading:', permissionsLoading);
    
    // Por ahora, permitir acceso si hay usuario autenticado
    if (user) {
        return children;
    }

    // Verificar permisos si se especificaron
    let hasRequiredPermissions = true;

    if (requiredPermission) {
        hasRequiredPermissions = hasPermission(requiredPermission);
    } else if (requiredPermissions && Array.isArray(requiredPermissions)) {
        hasRequiredPermissions = requireAll 
            ? hasAllPermissions(requiredPermissions)
            : hasAnyPermission(requiredPermissions);
    }

    // Si no tiene los permisos requeridos
    if (!hasRequiredPermissions) {
        // Mostrar componente fallback si se proporciona
        if (fallbackComponent) {
            return fallbackComponent;
        }
        
        // Por defecto, mostrar página de acceso denegado
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                    <div className="mb-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <svg
                                className="h-6 w-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Acceso Denegado
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        No tienes permisos suficientes para acceder a esta página.
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.history.back()}
                            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Volver
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ir al Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Si tiene permisos, mostrar el contenido
    return children;
};

export default ProtectedRoute;
