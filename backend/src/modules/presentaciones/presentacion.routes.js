const express = require('express');
const presentacionController = require('./presentacion.controller');
const { authMiddleware, isAdmin, hasRole, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/presentaciones
 * @desc Obtener todas las presentaciones
 * @access Private (Requiere permiso items.ver)
 */
router.get('/', authMiddleware, hasPermission('items.ver'), presentacionController.getAllPresentaciones);

/**
 * @route GET /api/presentaciones/stats
 * @desc Obtener estadísticas de presentaciones
 * @access Private (Requiere permiso items.ver)
 */
router.get('/stats', authMiddleware, hasPermission('items.ver'), presentacionController.getPresentacionStats);

/**
 * @route GET /api/presentaciones/search
 * @desc Buscar presentaciones
 * @access Private (Requiere permiso items.ver)
 */
router.get('/search', authMiddleware, hasPermission('items.ver'), presentacionController.searchPresentaciones);

/**
 * @route GET /api/presentaciones/unidad-medida/:unidadMedidaId
 * @desc Obtener presentaciones por unidad de medida
 * @access Private (Requiere permiso items.ver)
 */
router.get('/unidad-medida/:unidadMedidaId', authMiddleware, hasPermission('items.ver'), presentacionController.getPresentacionesByUnidadMedida);

/**
 * @route GET /api/presentaciones/:id
 * @desc Obtener presentación por ID
 * @access Private (Requiere permiso items.ver)
 */
router.get('/:id', authMiddleware, hasPermission('items.ver'), presentacionController.getPresentacionById);

/**
 * @route POST /api/presentaciones
 * @desc Crear nueva presentación
 * @access Private (Requiere permiso items.crear)
 */
router.post('/', authMiddleware, hasPermission('items.crear'), presentacionController.createPresentacion);

/**
 * @route PUT /api/presentaciones/:id
 * @desc Actualizar presentación
 * @access Private (Requiere permiso items.editar)
 */
router.put('/:id', authMiddleware, hasPermission('items.editar'), presentacionController.updatePresentacion);

/**
 * @route DELETE /api/presentaciones/:id
 * @desc Eliminar presentación
 * @access Private (Requiere permiso items.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('items.eliminar'), presentacionController.deletePresentacion);

module.exports = router;
