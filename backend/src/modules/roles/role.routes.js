const express = require('express');
const router = express.Router();
const RoleController = require('./role.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

/**
 * @route GET /api/roles
 * @desc Obtener todos los roles
 * @access Private (Requiere permiso roles.ver)
 */
router.get('/', hasPermission('roles.ver'), RoleController.getAllRoles);

/**
 * @route GET /api/roles/:id
 * @desc Obtener un rol por ID
 * @access Private (Requiere permiso roles.ver)
 */
router.get('/:id', hasPermission('roles.ver'), RoleController.getRoleById);

/**
 * @route POST /api/roles
 * @desc Crear un nuevo rol
 * @access Private (Requiere permiso roles.crear)
 */
router.post('/', hasPermission('roles.crear'), RoleController.createRole);

/**
 * @route PUT /api/roles/:id
 * @desc Actualizar un rol
 * @access Private (Requiere permiso roles.editar)
 */
router.put('/:id', hasPermission('roles.editar'), RoleController.updateRole);

/**
 * @route DELETE /api/roles/:id
 * @desc Eliminar un rol
 * @access Private (Requiere permiso roles.eliminar)
 */
router.delete('/:id', hasPermission('roles.eliminar'), RoleController.deleteRole);

/**
 * @route GET /api/roles/:id/permissions
 * @desc Obtener permisos de un rol
 * @access Private (Requiere permiso roles.ver)
 */
router.get('/:id/permissions', hasPermission('roles.ver'), RoleController.getRolePermissions);

/**
 * @route PUT /api/roles/:id/permissions
 * @desc Asignar permisos a un rol
 * @access Private (Requiere permiso roles.asignar_permisos)
 */
router.put('/:id/permissions', hasPermission('roles.asignar_permisos'), RoleController.assignRolePermissions);

module.exports = router;
