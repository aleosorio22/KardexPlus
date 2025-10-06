import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PermissionsContext = createContext();

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissions debe ser usado dentro de un PermissionsProvider');
    }
    return context;
};

export const PermissionsProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [permissionsByModule, setPermissionsByModule] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useAuth();
    const user = auth?.user;
    const token = auth?.token;

    // Cargar permisos del usuario actual
    const loadUserPermissions = async () => {
        if (!token || !user) {
            setPermissions([]);
            setPermissionsByModule({});
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3499/api';
            const response = await fetch(`${API_BASE_URL}/permissions/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                setPermissions(data.data.permissions || []);
                setPermissionsByModule(data.data.permissionsByModule || {});
            } else {
                throw new Error(data.message || 'Error al cargar permisos');
            }
        } catch (error) {
            console.error('PermissionsContext - Error cargando permisos:', error);
            setError(error.message);
            setPermissions([]);
            setPermissionsByModule({});
        } finally {
            setLoading(false);
        }
    };

    // Verificar si el usuario tiene un permiso específico
    const hasPermission = (permissionCode) => {
        if (!permissionCode || !Array.isArray(permissions)) return false;
        return permissions.includes(permissionCode);
    };

    // Verificar si el usuario tiene al menos uno de los permisos especificados
    const hasAnyPermission = (permissionCodes) => {
        if (!Array.isArray(permissionCodes) || !Array.isArray(permissions)) return false;
        return permissionCodes.some(code => permissions.includes(code));
    };

    // Verificar si el usuario tiene todos los permisos especificados
    const hasAllPermissions = (permissionCodes) => {
        if (!Array.isArray(permissionCodes) || !Array.isArray(permissions)) return false;
        return permissionCodes.every(code => permissions.includes(code));
    };

    // Verificar si el usuario tiene permisos para un módulo específico
    const hasModulePermissions = (moduleName) => {
        return permissionsByModule[moduleName] && permissionsByModule[moduleName].length > 0;
    };

    // Obtener permisos de un módulo específico
    const getModulePermissions = (moduleName) => {
        return permissionsByModule[moduleName] || [];
    };

    // Verificar si es administrador (helper común)
    const isAdmin = () => {
        return user?.rol === 'Administrador';
    };

    // Recargar permisos manualmente
    const reloadPermissions = () => {
        loadUserPermissions();
    };

    // Efecto para cargar permisos cuando el usuario cambia
    useEffect(() => {
        loadUserPermissions();
    }, [user, token]);

    const value = {
        // Estados
        permissions,
        permissionsByModule,
        loading,
        error,
        
        // Funciones de verificación
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasModulePermissions,
        getModulePermissions,
        isAdmin,
        
        // Utilidades
        reloadPermissions
    };

    return (
        <PermissionsContext.Provider value={value}>
            {children}
        </PermissionsContext.Provider>
    );
};

export default PermissionsContext;
