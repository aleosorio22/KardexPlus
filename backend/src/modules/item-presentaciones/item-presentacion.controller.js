const ItemPresentacionModel = require('./item-presentacion.model');

/**
 * Obtiene todas las presentaciones de items
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAllItemPresentaciones = async (req, res) => {
    try {
        const presentaciones = await ItemPresentacionModel.findAll();
        
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al obtener presentaciones de items:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene presentaciones con paginación y filtros
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getItemPresentacionesWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const itemId = req.query.itemId || '';
        const offset = (page - 1) * limit;

        const result = await ItemPresentacionModel.findWithPagination(offset, limit, search, itemId);
        
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
        console.error('Error al obtener presentaciones con paginación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene una presentación por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getItemPresentacionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de presentación inválido'
            });
        }

        const presentacion = await ItemPresentacionModel.findById(parseInt(id));
        
        if (!presentacion) {
            return res.status(404).json({
                success: false,
                message: 'Presentación de item no encontrada'
            });
        }
        
        res.json({
            success: true,
            data: presentacion
        });
    } catch (error) {
        console.error('Error al obtener presentación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene todas las presentaciones de un item específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getItemPresentacionesByItemId = async (req, res) => {
    try {
        const { itemId } = req.params;
        
        // Validar que el ID sea un número
        if (!itemId || isNaN(itemId)) {
            return res.status(400).json({
                success: false,
                message: 'ID de item inválido'
            });
        }

        const presentaciones = await ItemPresentacionModel.findByItemId(parseInt(itemId));
        
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al obtener presentaciones del item:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Crea una nueva presentación de item
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.createItemPresentacion = async (req, res) => {
    try {
        const {
            Item_Id,
            Presentacion_Nombre,
            Cantidad_Base,
            Item_Presentacion_CodigoSKU,
            Item_Presentaciones_CodigoBarras,
            Item_Presentaciones_Costo
        } = req.body;

        // Validaciones
        if (!Item_Id || isNaN(Item_Id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de item es requerido y debe ser un número válido'
            });
        }

        if (!Presentacion_Nombre || Presentacion_Nombre.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la presentación es requerido'
            });
        }

        if (!Cantidad_Base || isNaN(Cantidad_Base) || parseFloat(Cantidad_Base) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad base es requerida y debe ser mayor a 0'
            });
        }

        // Validar longitud de campos
        if (Presentacion_Nombre.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la presentación no puede exceder 30 caracteres'
            });
        }

        if (Item_Presentacion_CodigoSKU && Item_Presentacion_CodigoSKU.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'El código SKU no puede exceder 20 caracteres'
            });
        }

        if (Item_Presentaciones_CodigoBarras && Item_Presentaciones_CodigoBarras.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'El código de barras no puede exceder 20 caracteres'
            });
        }

        // Validar costo si se proporciona
        if (Item_Presentaciones_Costo !== undefined && Item_Presentaciones_Costo !== null && parseFloat(Item_Presentaciones_Costo) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El costo debe ser mayor o igual a 0'
            });
        }

        const presentacionData = {
            Item_Id: parseInt(Item_Id),
            Presentacion_Nombre: Presentacion_Nombre.trim(),
            Cantidad_Base: parseFloat(Cantidad_Base),
            Item_Presentacion_CodigoSKU: Item_Presentacion_CodigoSKU ? Item_Presentacion_CodigoSKU.trim() : null,
            Item_Presentaciones_CodigoBarras: Item_Presentaciones_CodigoBarras ? Item_Presentaciones_CodigoBarras.trim() : null,
            Item_Presentaciones_Costo: Item_Presentaciones_Costo ? parseFloat(Item_Presentaciones_Costo) : null
        };

        const presentacionId = await ItemPresentacionModel.create(presentacionData);
        
        res.status(201).json({
            success: true,
            message: 'Presentación de item creada exitosamente',
            data: { 
                Item_Presentaciones_Id: presentacionId,
                ...presentacionData
            }
        });
    } catch (error) {
        console.error('Error al crear presentación de item:', error);
        
        // Manejar errores específicos
        if (error.message.includes('Ya existe')) {
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
 * Actualiza una presentación de item
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updateItemPresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Item_Id,
            Presentacion_Nombre,
            Cantidad_Base,
            Item_Presentacion_CodigoSKU,
            Item_Presentaciones_CodigoBarras,
            Item_Presentaciones_Costo
        } = req.body;

        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de presentación inválido'
            });
        }

        // Verificar que la presentación existe
        const existingPresentacion = await ItemPresentacionModel.findById(parseInt(id));
        if (!existingPresentacion) {
            return res.status(404).json({
                success: false,
                message: 'Presentación de item no encontrada'
            });
        }

        // Validaciones
        if (!Item_Id || isNaN(Item_Id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de item es requerido y debe ser un número válido'
            });
        }

        if (!Presentacion_Nombre || Presentacion_Nombre.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la presentación es requerido'
            });
        }

        if (!Cantidad_Base || isNaN(Cantidad_Base) || parseFloat(Cantidad_Base) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad base es requerida y debe ser mayor a 0'
            });
        }

        // Validar longitud de campos
        if (Presentacion_Nombre.length > 30) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la presentación no puede exceder 30 caracteres'
            });
        }

        if (Item_Presentacion_CodigoSKU && Item_Presentacion_CodigoSKU.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'El código SKU no puede exceder 20 caracteres'
            });
        }

        if (Item_Presentaciones_CodigoBarras && Item_Presentaciones_CodigoBarras.length > 20) {
            return res.status(400).json({
                success: false,
                message: 'El código de barras no puede exceder 20 caracteres'
            });
        }

        // Validar costo si se proporciona
        if (Item_Presentaciones_Costo !== undefined && Item_Presentaciones_Costo !== null && parseFloat(Item_Presentaciones_Costo) < 0) {
            return res.status(400).json({
                success: false,
                message: 'El costo debe ser mayor o igual a 0'
            });
        }

        const presentacionData = {
            Item_Id: parseInt(Item_Id),
            Presentacion_Nombre: Presentacion_Nombre.trim(),
            Cantidad_Base: parseFloat(Cantidad_Base),
            Item_Presentacion_CodigoSKU: Item_Presentacion_CodigoSKU ? Item_Presentacion_CodigoSKU.trim() : null,
            Item_Presentaciones_CodigoBarras: Item_Presentaciones_CodigoBarras ? Item_Presentaciones_CodigoBarras.trim() : null,
            Item_Presentaciones_Costo: Item_Presentaciones_Costo ? parseFloat(Item_Presentaciones_Costo) : null
        };

        const updated = await ItemPresentacionModel.update(parseInt(id), presentacionData);
        
        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la presentación'
            });
        }
        
        res.json({
            success: true,
            message: 'Presentación de item actualizada exitosamente',
            data: {
                Item_Presentaciones_Id: parseInt(id),
                ...presentacionData
            }
        });
    } catch (error) {
        console.error('Error al actualizar presentación de item:', error);
        
        // Manejar errores específicos
        if (error.message.includes('Ya existe')) {
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
 * Elimina una presentación de item
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.deleteItemPresentacion = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validar que el ID sea un número
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de presentación inválido'
            });
        }

        // Verificar que la presentación existe
        const existingPresentacion = await ItemPresentacionModel.findById(parseInt(id));
        if (!existingPresentacion) {
            return res.status(404).json({
                success: false,
                message: 'Presentación de item no encontrada'
            });
        }

        const deleted = await ItemPresentacionModel.delete(parseInt(id));
        
        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la presentación'
            });
        }
        
        res.json({
            success: true,
            message: 'Presentación de item eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar presentación de item:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtiene estadísticas de presentaciones
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getItemPresentacionStats = async (req, res) => {
    try {
        const stats = await ItemPresentacionModel.getStats();
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de presentaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Busca presentaciones
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.searchItemPresentaciones = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Término de búsqueda requerido'
            });
        }

        const presentaciones = await ItemPresentacionModel.search(q.trim());
        
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al buscar presentaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Verifica si una presentación existe
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.checkItemPresentacionExists = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de presentación inválido'
            });
        }

        const exists = await ItemPresentacionModel.exists(parseInt(id));
        
        res.json({
            success: true,
            exists: exists
        });
    } catch (error) {
        console.error('Error al verificar existencia de presentación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
