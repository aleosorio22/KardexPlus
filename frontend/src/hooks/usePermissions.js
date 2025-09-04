import { usePermissions as usePermissionsContext } from '../context/PermissionsContext';

// Hook personalizado para verificar permisos con funcionalidades adicionales
export const usePermissions = () => {
    const context = usePermissionsContext();
    
    if (!context) {
        throw new Error('usePermissions debe ser usado dentro de un PermissionsProvider');
    }

    return context;
};

// Hook específico para verificar un permiso único
export const usePermission = (permissionCode) => {
    const { hasPermission, loading } = usePermissions();
    
    return {
        allowed: hasPermission(permissionCode),
        loading
    };
};

// Hook para verificar múltiples permisos
export const useMultiplePermissions = (permissionCodes, requireAll = false) => {
    const { hasAnyPermission, hasAllPermissions, loading } = usePermissions();
    
    const allowed = requireAll 
        ? hasAllPermissions(permissionCodes)
        : hasAnyPermission(permissionCodes);
    
    return {
        allowed,
        loading
    };
};

// Hook para verificar permisos de un módulo
export const useModulePermissions = (moduleName) => {
    const { hasModulePermissions, getModulePermissions, loading } = usePermissions();
    
    return {
        hasAccess: hasModulePermissions(moduleName),
        permissions: getModulePermissions(moduleName),
        loading
    };
};

// Hook para verificar si es administrador
export const useIsAdmin = () => {
    const { isAdmin, loading } = usePermissions();
    
    return {
        isAdmin: isAdmin(),
        loading
    };
};

// Hook para permisos comunes de CRUD
export const useCrudPermissions = (module) => {
    const { hasPermission, loading } = usePermissions();
    
    return {
        canView: hasPermission(`${module}.ver`),
        canCreate: hasPermission(`${module}.crear`),
        canEdit: hasPermission(`${module}.editar`),
        canDelete: hasPermission(`${module}.eliminar`),
        loading
    };
};

export default usePermissions;
