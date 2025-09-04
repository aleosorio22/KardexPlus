const express = require('express');
const userController = require('./user.controller');
const { authMiddleware, isAdmin, hasRole } = require('../../core/middlewares/auth.middleware');

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
 * @access Private (Admin)
 */
router.post('/register', authMiddleware, isAdmin, userController.register);

/**
 * @route GET /api/users
 * @desc Obtener todos los usuarios
 * @access Private (Admin)
 */
router.get('/', authMiddleware, isAdmin, userController.getAllUsers);

/**
 * @route GET /api/users/available
 * @desc Obtener usuarios disponibles
 * @access Private (Admin, Gerente)
 */
router.get('/available', authMiddleware, hasRole(['Administrador', 'Gerente']), userController.getAvailableUsers);

/**
 * @route GET /api/users/profile
 * @desc Obtener perfil del usuario autenticado
 * @access Private
 */
router.get('/profile', authMiddleware, userController.getProfile);

/**
 * @route GET /api/users/:id
 * @desc Obtener usuario por ID
 * @access Private (Admin)
 */
router.get('/:id', authMiddleware, isAdmin, userController.getUserById);

/**
 * @route PUT /api/users/:id
 * @desc Actualizar usuario
 * @access Private (Admin)
 */
router.put('/:id', authMiddleware, isAdmin, userController.updateUser);

/**
 * @route PUT /api/users/:id/password
 * @desc Actualizar contraseña de usuario
 * @access Private (Admin)
 */
router.put('/:id/password', authMiddleware, isAdmin, userController.updatePassword);

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar (desactivar) usuario
 * @access Private (Admin)
 */
router.delete('/:id', authMiddleware, isAdmin, userController.deleteUser);

module.exports = router;
