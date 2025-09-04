const RoleModel = require('./role.model');
const db = require('../../core/config/database');

class RoleController {
    // Obtener todos los roles
    static async getAllRoles(req, res) {
        try {
            const roles = await RoleModel.findAll();
            
            res.json({
                success: true,
                data: roles,
                message: 'Roles obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener un rol por ID
    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const role = await RoleModel.findById(id);

            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            res.json({
                success: true,
                data: role,
                message: 'Rol obtenido exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Crear un nuevo rol
    static async createRole(req, res) {
        try {
            const { Rol_Nombre, Rol_Descripcion } = req.body;

            // Validaciones
            if (!Rol_Nombre || Rol_Nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del rol es obligatorio'
                });
            }

            // Verificar si el rol ya existe
            const exists = await RoleModel.existsByName(Rol_Nombre);
            if (exists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un rol con ese nombre'
                });
            }

            const roleId = await RoleModel.create({
                Rol_Nombre: Rol_Nombre.trim(),
                Rol_Descripcion: Rol_Descripcion?.trim()
            });

            const newRole = await RoleModel.findById(roleId);

            res.status(201).json({
                success: true,
                data: newRole,
                message: 'Rol creado exitosamente'
            });
        } catch (error) {
            console.error('Error creando rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Actualizar un rol
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { Rol_Nombre, Rol_Descripcion } = req.body;

            // Verificar si el rol existe
            const existingRole = await RoleModel.findById(id);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            // Validaciones
            if (!Rol_Nombre || Rol_Nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del rol es obligatorio'
                });
            }

            // Verificar si el nuevo nombre ya existe (excluyendo el rol actual)
            const nameExists = await RoleModel.existsByName(Rol_Nombre, id);
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un rol con ese nombre'
                });
            }

            const updated = await RoleModel.update(id, {
                Rol_Nombre: Rol_Nombre.trim(),
                Rol_Descripcion: Rol_Descripcion?.trim()
            });

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el rol'
                });
            }

            const updatedRole = await RoleModel.findById(id);

            res.json({
                success: true,
                data: updatedRole,
                message: 'Rol actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Eliminar un rol
    static async deleteRole(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el rol existe
            const existingRole = await RoleModel.findById(id);
            if (!existingRole) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            const deleted = await RoleModel.delete(id);

            if (!deleted) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo eliminar el rol'
                });
            }

            res.json({
                success: true,
                message: 'Rol eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando rol:', error);
            
            // Manejar error específico de rol con usuarios asignados
            if (error.message.includes('usuarios asignados')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener permisos de un rol
    static async getRolePermissions(req, res) {
        try {
            const { id } = req.params;

            // Verificar si el rol existe
            const role = await RoleModel.findById(id);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            const permissions = await RoleModel.getRolePermissions(id);

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
                    descripcion: permission.Permiso_Descripcion,
                    fechaAsignacion: permission.Fecha_Asignacion
                });
                return acc;
            }, {});

            res.json({
                success: true,
                data: {
                    role,
                    permissions,
                    permissionsByModule,
                    totalPermissions: permissions.length
                },
                message: 'Permisos del rol obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo permisos del rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Asignar permisos a un rol
    static async assignRolePermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissionIds } = req.body;

            // Verificar si el rol existe
            const role = await RoleModel.findById(id);
            if (!role) {
                return res.status(404).json({
                    success: false,
                    message: 'Rol no encontrado'
                });
            }

            // Validar que permissionIds sea un array
            if (!Array.isArray(permissionIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'Los IDs de permisos deben ser un array'
                });
            }

            // Verificar que todos los permisos existen
            if (permissionIds.length > 0) {
                const placeholders = permissionIds.map(() => '?').join(',');
                const [validPermissions] = await db.execute(
                    `SELECT COUNT(*) as count FROM Permisos WHERE Permiso_Id IN (${placeholders}) AND Permiso_Estado = true`,
                    permissionIds
                );

                if (validPermissions[0].count !== permissionIds.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Algunos permisos especificados no existen o no están activos'
                    });
                }
            }

            await RoleModel.assignPermissions(id, permissionIds);

            res.json({
                success: true,
                message: 'Permisos asignados exitosamente al rol'
            });
        } catch (error) {
            console.error('Error asignando permisos al rol:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = RoleController;
