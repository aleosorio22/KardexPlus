const CategoryModel = require('./category.model');

/**
 * Obtiene todas las categorías
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.findAll();
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene categorías con paginación y filtros
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getCategoriesWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const result = await CategoryModel.findWithPagination(offset, limit, search);
        
        res.json({
            success: true,
            data: result.data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalRecords: result.total,
                recordsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error al obtener categorías con paginación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene una categoría por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const category = await CategoryModel.findById(parseInt(id));
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Crea una nueva categoría
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.createCategory = async (req, res) => {
    try {
        const { CategoriaItem_Nombre, CategoriaItem_Descripcion } = req.body;
        
        // Validaciones
        if (!CategoriaItem_Nombre || CategoriaItem_Nombre.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }

        // Validar longitud del nombre
        if (CategoriaItem_Nombre.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría no puede exceder 50 caracteres'
            });
        }

        // Validar longitud de la descripción si se proporciona
        if (CategoriaItem_Descripcion && CategoriaItem_Descripcion.length > 150) {
            return res.status(400).json({
                success: false,
                message: 'La descripción no puede exceder 150 caracteres'
            });
        }

        const categoryData = {
            CategoriaItem_Nombre: CategoriaItem_Nombre.trim(),
            CategoriaItem_Descripcion: CategoriaItem_Descripcion ? CategoriaItem_Descripcion.trim() : null
        };

        const categoryId = await CategoryModel.create(categoryData);
        
        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: { 
                CategoriaItem_Id: categoryId,
                ...categoryData
            }
        });
    } catch (error) {
        console.error('Error al crear categoría:', error);
        
        // Manejar errores específicos
        if (error.message.includes('Ya existe una categoría')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualiza una categoría
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { CategoriaItem_Nombre, CategoriaItem_Descripcion } = req.body;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        // Validaciones
        if (!CategoriaItem_Nombre || CategoriaItem_Nombre.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido'
            });
        }

        // Validar longitud del nombre
        if (CategoriaItem_Nombre.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría no puede exceder 50 caracteres'
            });
        }

        // Validar longitud de la descripción si se proporciona
        if (CategoriaItem_Descripcion && CategoriaItem_Descripcion.length > 150) {
            return res.status(400).json({
                success: false,
                message: 'La descripción no puede exceder 150 caracteres'
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await CategoryModel.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const categoryData = {
            CategoriaItem_Nombre: CategoriaItem_Nombre.trim(),
            CategoriaItem_Descripcion: CategoriaItem_Descripcion ? CategoriaItem_Descripcion.trim() : null
        };

        const updated = await CategoryModel.update(parseInt(id), categoryData);
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo actualizar la categoría'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: {
                CategoriaItem_Id: parseInt(id),
                ...categoryData
            }
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        
        // Manejar errores específicos
        if (error.message.includes('Ya existe una categoría')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Elimina una categoría
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        // Verificar que la categoría existe
        const existingCategory = await CategoryModel.findById(parseInt(id));
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        const deleted = await CategoryModel.delete(parseInt(id));
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'No se pudo eliminar la categoría'
            });
        }
        
        res.json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        
        // Manejar errores específicos
        if (error.message.includes('está siendo utilizada')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene estadísticas de categorías
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getCategoryStats = async (req, res) => {
    try {
        const totalCategories = await CategoryModel.count();
        
        res.json({
            success: true,
            data: {
                totalCategories
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de categorías:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Verifica si una categoría existe
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.checkCategoryExists = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de categoría inválido'
            });
        }

        const exists = await CategoryModel.exists(parseInt(id));
        
        res.json({
            success: true,
            data: { exists }
        });
    } catch (error) {
        console.error('Error al verificar existencia de categoría:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
