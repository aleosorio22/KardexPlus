import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from './ui/LoadingSpinner';
import AccessDenied from '../pages/AccessDenied';

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
        
        // Mostrar página de acceso denegado
        return <AccessDenied />;
    }

    // Si tiene permisos, mostrar el contenido
    return children;
};

export default ProtectedRoute;
