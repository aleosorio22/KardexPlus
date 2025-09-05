const express = require('express');
const categoryController = require('./category.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Obtener todas las categorías
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/', authMiddleware, hasPermission('categorias.ver'), categoryController.getAllCategories);

/**
 * @route GET /api/categories/paginated
 * @desc Obtener categorías con paginación y filtros
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/paginated', authMiddleware, hasPermission('categorias.ver'), categoryController.getCategoriesWithPagination);

/**
 * @route GET /api/categories/stats
 * @desc Obtener estadísticas de categorías
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/stats', authMiddleware, hasPermission('categorias.ver'), categoryController.getCategoryStats);

/**
 * @route GET /api/categories/:id
 * @desc Obtener categoría por ID
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/:id', authMiddleware, hasPermission('categorias.ver'), categoryController.getCategoryById);

/**
 * @route GET /api/categories/:id/exists
 * @desc Verificar si una categoría existe
 * @access Private (Requiere permiso categorias.ver)
 */
router.get('/:id/exists', authMiddleware, hasPermission('categorias.ver'), categoryController.checkCategoryExists);

/**
 * @route POST /api/categories
 * @desc Crear nueva categoría
 * @access Private (Requiere permiso categorias.crear)
 */
router.post('/', authMiddleware, hasPermission('categorias.crear'), categoryController.createCategory);

/**
 * @route PUT /api/categories/:id
 * @desc Actualizar categoría
 * @access Private (Requiere permiso categorias.editar)
 */
router.put('/:id', authMiddleware, hasPermission('categorias.editar'), categoryController.updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Eliminar categoría
 * @access Private (Requiere permiso categorias.eliminar)
 */
router.delete('/:id', authMiddleware, hasPermission('categorias.eliminar'), categoryController.deleteCategory);

module.exports = router;
