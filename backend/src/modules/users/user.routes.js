const express = require('express');
const userController = require('./user.controller');
const { authMiddleware, isAdmin, hasRole, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/users/create-admin
 * @desc Crear usuario administrador inicial
 * @access Public (solo funciona si no existe admin)
 */
router.post('/create-admin', userController.createAdminUser);

/**
 * @route POST /api/users/login
 * @desc Autenticar usuario y obtener token JWT
 * @access Public
 */
router.post('/login', userController.login);

/**
 * @route POST /api/users/register
 * @desc Registrar nuevo usuario
 * @access Private (Requiere permiso usuarios.crear)
 */
router.post('/register', authMiddleware, hasPermission('usuarios.crear'), userController.register);

/**
 * @route GET /api/users
 * @desc Obtener todos los usuarios
 * @access Private (Requiere permiso usuarios.ver)
 */
router.get('/', authMiddleware, hasPermission('usuarios.ver'), userController.getAllUsers);

/**
 * @route GET /api/users/available
 * @desc Obtener usuarios disponibles
 * @access Private (Requiere permiso usuarios.ver)
 */
router.get('/available', authMiddleware, hasPermission('usuarios.ver'), userController.getAvailableUsers);

/**
 * @route GET /api/users/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route GET /api/users/:id
 * @desc Obtener usuario por ID
 * @access Private (Requiere permiso usuarios.ver)
 */
router.get('/:id', authMiddleware, hasPermission('usuarios.ver'), userController.getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar usuario
 * @access Private (Requiere permiso usuarios.editar)
 */
router.put('/:id', authMiddleware, hasPermission('usuarios.editar'), userController.updateUser);

/**
 * @route PATCH /api/users/:id/toggle-status
 * @desc Cambiar estado del usuario (activar/desactivar)
 * @access Private (Requiere permiso usuarios.editar)
 */
router.patch('/:id/toggle-status', authMiddleware, hasPermission('usuarios.editar'), userController.toggleUserStatus);

/**
 * @route PUT /api/users/:id/password
 * @desc Actualizar contraseña de usuario
 * @access Private (Requiere permiso usuarios.editar)
 */
router.put('/:id/password', authMiddleware, hasPermission('usuarios.editar'), userController.updatePassword);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar (desactivar) usuario
 * @access Private (Requiere permiso usuarios.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('usuarios.eliminar'), userController.deleteUser);

module.exports = router;
