const express = require('express');
const itemController = require('./item.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/items
 * @desc Obtener todos los items
 * @access Private (Requiere permiso items.ver)
 */
router.get('/', authMiddleware, hasPermission('items.ver'), itemController.getAllItems);

/**
 * @route GET /api/items/paginated
 * @desc Obtener items con paginación y filtros
 * @access Private (Requiere permiso items.ver)
 */
router.get('/paginated', authMiddleware, hasPermission('items.ver'), itemController.getItemsWithPagination);

/**
 * @route GET /api/items/stats
 * @desc Obtener estadísticas de items
 * @access Private (Requiere permiso items.ver)
 */
router.get('/stats', authMiddleware, hasPermission('items.ver'), itemController.getItemStats);

/**
 * @route GET /api/items/search
 * @desc Buscar items
 * @access Private (Requiere permiso items.ver)
 */
router.get('/search', authMiddleware, hasPermission('items.ver'), itemController.searchItems);

/**
 * @route GET /api/items/categoria/:categoriaId
 * @desc Obtener items por categoría
 * @access Private (Requiere permiso items.ver)
 */
router.get('/categoria/:categoriaId', authMiddleware, hasPermission('items.ver'), itemController.getItemsByCategory);

/**
 * @route GET /api/items/:id
 * @desc Obtener item por ID
 * @access Private (Requiere permiso items.ver)
 */
router.get('/:id', authMiddleware, hasPermission('items.ver'), itemController.getItemById);

/**
 * @route GET /api/items/:id/exists
 * @desc Verificar si un item existe
 * @access Private (Requiere permiso items.ver)
 */
router.get('/:id/exists', authMiddleware, hasPermission('items.ver'), itemController.checkItemExists);

/**
 * @route POST /api/items
 * @desc Crear nuevo item
 * @access Private (Requiere permiso items.crear)
 */
router.post('/', authMiddleware, hasPermission('items.crear'), itemController.createItem);

/**
 * @route PUT /api/items/:id
 * @desc Actualizar item
 * @access Private (Requiere permiso items.editar)
 */
router.put('/:id', authMiddleware, hasPermission('items.editar'), itemController.updateItem);

/**
 * @route DELETE /api/items/:id
 * @desc Desactivar item
 * @access Private (Requiere permiso items.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('items.eliminar'), itemController.deleteItem);

/**
 * @route POST /api/items/:id/restore
 * @desc Restaurar/activar item
 * @access Private (Requiere permiso items.editar)
 */
router.post('/:id/restore', authMiddleware, hasPermission('items.editar'), itemController.restoreItem);

/**
 * @route PATCH /api/items/:id/toggle-status
 * @desc Toggle del estado de un item
 * @access Private (Requiere permiso items.editar)
 */
router.patch('/:id/toggle-status', authMiddleware, hasPermission('items.editar'), itemController.toggleItemStatus);

module.exports = router;
