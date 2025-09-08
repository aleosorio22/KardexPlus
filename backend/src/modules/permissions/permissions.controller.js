const db = require('../../core/config/database');

class PermissionsController {
    // Obtener todos los permisos efectivos de un usuario
    static async getUserPermissions(req, res) {
        try {
            const { userId } = req.params;
            
            // Verificar que solo el propio usuario o admin puede ver los permisos
            if (req.user.id !== parseInt(userId) && req.user.rol !== 'Administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver esta información'
                });
            }

            const [permissions] = await db.execute(
                `SELECT 
                    Permiso_Id,
                    Permiso_Codigo,
                    Permiso_Nombre,
                    Permiso_Modulo,
                    Estado_Permiso,
                    Origen_Permiso
                FROM v_permisos_usuario 
                WHERE Usuario_Id = ? AND Estado_Permiso = 'PERMITIDO'
                ORDER BY Permiso_Modulo, Permiso_Codigo`,
                [userId]
            );

            // Agrupar permisos por módulo
            const permissionsByModule = permissions.reduce((acc, permission) => {
                const module = permission.Permiso_Modulo;
                if (!acc[module]) {
                    acc[module] = [];
                }
                acc[module].push({
                    id: permission.Permiso_Id,
                    codigo: permission.Permiso_Codigo,
                    nombre: permission.Permiso_Nombre,
                    origen: permission.Origen_Permiso
                });
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    userId: parseInt(userId),
                    totalPermissions: permissions.length,
                    permissionsByModule,
                    permissions: permissions.map(p => p.Permiso_Codigo)
                }
            });

        } catch (error) {
            console.error('Error obteniendo permisos del usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar si un usuario tiene un permiso específico
    static async checkUserPermission(req, res) {
        try {
            const { userId, permissionCode } = req.params;
            
            // Verificar que solo el propio usuario o admin puede verificar permisos
            if (req.user.id !== parseInt(userId) && req.user.rol !== 'Administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para verificar esta información'
                });
            }

            const [rows] = await db.execute(
                'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
                [userId, permissionCode]
            );

            const hasPermission = rows[0].tiene_permiso === 1;

            res.json({
                success: true,
                data: {
                    userId: parseInt(userId),
                    permissionCode,
                    hasPermission
                }
            });

        } catch (error) {
            console.error('Error verificando permiso específico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Verificar múltiples permisos de una vez
    static async checkMultiplePermissions(req, res) {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            
            // Verificar que solo el propio usuario o admin puede verificar permisos
            if (req.user.id !== parseInt(userId) && req.user.rol !== 'Administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para verificar esta información'
                });
            }

            if (!Array.isArray(permissions) || permissions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se debe proporcionar un array de permisos para verificar'
                });
            }

            const permissionResults = await Promise.all(
                permissions.map(async (permissionCode) => {
                    try {
                        const [rows] = await db.execute(
                            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
                            [userId, permissionCode]
                        );
                        return {
                            code: permissionCode,
                            hasPermission: rows[0].tiene_permiso === 1
                        };
                    } catch (error) {
                        return {
                            code: permissionCode,
                            hasPermission: false,
                            error: error.message
                        };
                    }
                })
            );

            res.json({
                success: true,
                data: {
                    userId: parseInt(userId),
                    results: permissionResults,
                    summary: {
                        total: permissions.length,
                        granted: permissionResults.filter(r => r.hasPermission).length,
                        denied: permissionResults.filter(r => !r.hasPermission).length
                    }
                }
            });

        } catch (error) {
            console.error('Error verificando múltiples permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener todos los permisos disponibles en el sistema (solo admin)
    static async getAllPermissions(req, res) {
        try {
            const [permissions] = await db.execute(
                `SELECT 
                    Permiso_Id,
                    Permiso_Codigo,
                    Permiso_Nombre,
                    Permiso_Modulo,
                    Permiso_Descripcion,
                    Permiso_Estado
                FROM Permisos 
                WHERE Permiso_Estado = true
                ORDER BY Permiso_Modulo, Permiso_Codigo`
            );

            // Agrupar por módulo
            const permissionsByModule = permissions.reduce((acc, permission) => {
                const module = permission.Permiso_Modulo;
                if (!acc[module]) {
                    acc[module] = [];
                }
                acc[module].push({
                    id: permission.Permiso_Id,
                    codigo: permission.Permiso_Codigo,
                    nombre: permission.Permiso_Nombre,
                    descripcion: permission.Permiso_Descripcion
                });
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    totalPermissions: permissions.length,
                    modules: Object.keys(permissionsByModule),
                    permissionsByModule,
                    permissions
                }
            });

        } catch (error) {
            console.error('Error obteniendo todos los permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener permisos del usuario actual (desde el token)
    static async getMyPermissions(req, res) {
        try {
            const userId = req.user.id;

            const [permissions] = await db.execute(
                `SELECT 
                    Permiso_Codigo,
                    Permiso_Nombre,
                    Permiso_Modulo
                FROM v_permisos_usuario 
                WHERE Usuario_Id = ? AND Estado_Permiso = 'PERMITIDO'
                ORDER BY Permiso_Modulo, Permiso_Codigo`,
                [userId]
            );

            // Crear un simple array de códigos de permisos para uso fácil en frontend
            const permissionCodes = permissions.map(p => p.Permiso_Codigo);

            // Agrupar por módulo para navegación
            const permissionsByModule = permissions.reduce((acc, permission) => {
                const module = permission.Permiso_Modulo;
                if (!acc[module]) {
                    acc[module] = [];
                }
                acc[module].push(permission.Permiso_Codigo);
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    userId,
                    permissions: permissionCodes,
                    permissionsByModule,
                    totalPermissions: permissions.length
                }
            });

        } catch (error) {
            console.error('Error obteniendo mis permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = PermissionsController;
