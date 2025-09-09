const express = require('express');
const itemPresentacionController = require('./item-presentacion.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/item-presentaciones
 * @desc Obtener todas las presentaciones de items
 * @access Private (Requiere permiso items.ver)
 */
router.get('/', authMiddleware, hasPermission('items.ver'), itemPresentacionController.getAllItemPresentaciones);

/**
 * @route GET /api/item-presentaciones/paginated
 * @desc Obtener presentaciones con paginación y filtros
 * @access Private (Requiere permiso items.ver)
 */
router.get('/paginated', authMiddleware, hasPermission('items.ver'), itemPresentacionController.getItemPresentacionesWithPagination);

/**
 * @route GET /api/item-presentaciones/stats
 * @desc Obtener estadísticas de presentaciones
 * @access Private (Requiere permiso items.ver)
 */
router.get('/stats', authMiddleware, hasPermission('items.ver'), itemPresentacionController.getItemPresentacionStats);

/**
 * @route GET /api/item-presentaciones/search
 * @desc Buscar presentaciones
 * @access Private (Requiere permiso items.ver)
 */
router.get('/search', authMiddleware, hasPermission('items.ver'), itemPresentacionController.searchItemPresentaciones);

/**
 * @route GET /api/item-presentaciones/item/:itemId
 * @desc Obtener presentaciones de un item específico
 * @access Private (Requiere permiso items.ver)
 */
router.get('/item/:itemId', authMiddleware, hasPermission('items.ver'), itemPresentacionController.getItemPresentacionesByItemId);

/**
 * @route GET /api/item-presentaciones/:id
 * @desc Obtener presentación por ID
 * @access Private (Requiere permiso items.ver)
 */
router.get('/:id', authMiddleware, hasPermission('items.ver'), itemPresentacionController.getItemPresentacionById);

/**
 * @route GET /api/item-presentaciones/:id/exists
 * @desc Verificar si una presentación existe
 * @access Private (Requiere permiso items.ver)
 */
router.get('/:id/exists', authMiddleware, hasPermission('items.ver'), itemPresentacionController.checkItemPresentacionExists);

/**
 * @route POST /api/item-presentaciones
 * @desc Crear nueva presentación de item
 * @access Private (Requiere permiso items.crear)
 */
router.post('/', authMiddleware, hasPermission('items.crear'), itemPresentacionController.createItemPresentacion);

/**
 * @route PUT /api/item-presentaciones/:id
 * @desc Actualizar presentación de item
 * @access Private (Requiere permiso items.editar)
 */
router.put('/:id', authMiddleware, hasPermission('items.editar'), itemPresentacionController.updateItemPresentacion);

/**
 * @route DELETE /api/item-presentaciones/:id
 * @desc Eliminar presentación de item
 * @access Private (Requiere permiso items.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('items.eliminar'), itemPresentacionController.deleteItemPresentacion);

module.exports = router;
