const express = require('express');
const unidadMedidaController = require('./unidad-medida.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/unidades-medida
 * @desc Obtener todas las unidades de medida
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/', authMiddleware, hasPermission('categorias.ver'), unidadMedidaController.getAllUnidadesMedida);

/**
 * @route GET /api/unidades-medida/paginated
 * @desc Obtener unidades de medida con paginación y filtros
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/paginated', authMiddleware, hasPermission('categorias.ver'), unidadMedidaController.getUnidadesMedidaWithPagination);

/**
 * @route GET /api/unidades-medida/stats
 * @desc Obtener estadísticas de unidades de medida
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/stats', authMiddleware, hasPermission('categorias.ver'), unidadMedidaController.getUnidadMedidaStats);

/**
 * @route GET /api/unidades-medida/:id
 * @desc Obtener unidad de medida por ID
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/:id', authMiddleware, hasPermission('categorias.ver'), unidadMedidaController.getUnidadMedidaById);

/**
 * @route GET /api/unidades-medida/:id/exists
 * @desc Verificar si una unidad de medida existe
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/:id/exists', authMiddleware, hasPermission('categorias.ver'), unidadMedidaController.checkUnidadMedidaExists);

/**
 * @route POST /api/unidades-medida
 * @desc Crear nueva unidad de medida
 * @access Private (Requiere permiso categorias.crear)
 */
router.post('/', authMiddleware, hasPermission('categorias.crear'), unidadMedidaController.createUnidadMedida);

/**
 * @route PUT /api/unidades-medida/:id
 * @desc Actualizar unidad de medida
 * @access Private (Requiere permiso categorias.editar)
 */
router.put('/:id', authMiddleware, hasPermission('categorias.editar'), unidadMedidaController.updateUnidadMedida);

/**
 * @route DELETE /api/unidades-medida/:id
 * @desc Eliminar unidad de medida
 * @access Private (Requiere permiso categorias.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('categorias.eliminar'), unidadMedidaController.deleteUnidadMedida);

module.exports = router;
