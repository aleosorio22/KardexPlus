const express = require('express');
const router = express.Router();
const PermissionsController = require('./permissions.controller');
const { authMiddleware, isAdmin } = require('../../core/middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para obtener permisos

/**
 * @route GET /api/permissions/me
 * @desc Obtener permisos del usuario actual
 * @access Private
 */
router.get('/me', PermissionsController.getMyPermissions);

/**
 * @route GET /api/permissions/all
 * @desc Obtener todos los permisos disponibles en el sistema
 * @access Private (Solo Administrador)
 */
router.get('/all', isAdmin, PermissionsController.getAllPermissions);

/**
 * @route GET /api/permissions/user/:userId
 * @desc Obtener todos los permisos efectivos de un usuario específico
 * @access Private (Solo el propio usuario o Administrador)
 */
router.get('/user/:userId', PermissionsController.getUserPermissions);

/**
 * @route GET /api/permissions/user/:userId/check/:permissionCode
 * @desc Verificar si un usuario tiene un permiso específico
 * @access Private (Solo el propio usuario o Administrador)
 */
router.get('/user/:userId/check/:permissionCode', PermissionsController.checkUserPermission);

/**
 * @route POST /api/permissions/user/:userId/check-multiple
 * @desc Verificar múltiples permisos de un usuario
 * @body { permissions: ["permiso1", "permiso2", ...] }
 * @access Private (Solo el propio usuario o Administrador)
 */
router.post('/user/:userId/check-multiple', PermissionsController.checkMultiplePermissions);

module.exports = router;
