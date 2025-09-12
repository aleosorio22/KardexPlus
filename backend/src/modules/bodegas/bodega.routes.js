const express = require('express');
const bodegaController = require('./bodega.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/bodegas
 * @desc Obtener todas las bodegas
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getAllBodegas);

/**
 * @route GET /api/bodegas/paginated
 * @desc Obtener bodegas con paginación y filtros
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/paginated', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getBodegasWithPagination);

/**
 * @route GET /api/bodegas/stats
 * @desc Obtener estadísticas de bodegas
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/stats', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getBodegaStats);

/**
 * @route GET /api/bodegas/search
 * @desc Buscar bodegas
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/search', authMiddleware, hasPermission('bodegas.ver'), bodegaController.searchBodegas);

/**
 * @route GET /api/bodegas/active
 * @desc Obtener bodegas activas para selects
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/active', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getActiveBodegas);

/**
 * @route GET /api/bodegas/responsable/:responsableId
 * @desc Obtener bodegas por responsable
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/responsable/:responsableId', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getBodegasByResponsable);

/**
 * @route GET /api/bodegas/:id
 * @desc Obtener bodega por ID
 * @access Private (Requiere permiso bodegas.ver)
 */
router.get('/:id', authMiddleware, hasPermission('bodegas.ver'), bodegaController.getBodegaById);

/**
 * @route POST /api/bodegas
 * @desc Crear nueva bodega
 * @access Private (Requiere permiso bodegas.crear)
 */
router.post('/', authMiddleware, hasPermission('bodegas.crear'), bodegaController.createBodega);

/**
 * @route PUT /api/bodegas/:id
 * @desc Actualizar bodega
 * @access Private (Requiere permiso bodegas.editar)
 */
router.put('/:id', authMiddleware, hasPermission('bodegas.editar'), bodegaController.updateBodega);

/**
 * @route DELETE /api/bodegas/:id
 * @desc Desactivar bodega (soft delete)
 * @access Private (Requiere permiso bodegas.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('bodegas.eliminar'), bodegaController.deleteBodega);

/**
 * @route POST /api/bodegas/:id/restore
 * @desc Restaurar/activar bodega
 * @access Private (Requiere permiso bodegas.editar)
 */
router.post('/:id/restore', authMiddleware, hasPermission('bodegas.editar'), bodegaController.restoreBodega);

module.exports = router;
