const BodegaModel = require('./bodega.model');
const db = require('../../core/config/database');

/**
 * Validador para datos de bodega
 */
const validateBodegaData = (data, isUpdate = false) => {
    const errors = [];

    // Validar nombre (requerido)
    if (!data.Bodega_Nombre || data.Bodega_Nombre.trim() === '') {
        errors.push('El nombre de la bodega es obligatorio');
    } else if (data.Bodega_Nombre.length > 50) {
        errors.push('El nombre de la bodega no puede exceder 50 caracteres');
    }

    // Validar tipo (opcional pero con valores específicos)
    const tiposValidos = ['Central', 'Producción', 'Frío', 'Temporal', 'Descarte'];
    if (data.Bodega_Tipo && !tiposValidos.includes(data.Bodega_Tipo)) {
        errors.push('Tipo de bodega inválido. Tipos válidos: ' + tiposValidos.join(', '));
    }

    // Validar ubicación (opcional)
    if (data.Bodega_Ubicacion && data.Bodega_Ubicacion.length > 100) {
        errors.push('La ubicación no puede exceder 100 caracteres');
    }

    // Validar responsable (opcional pero debe existir si se proporciona)
    if (data.Responsable_Id && (isNaN(data.Responsable_Id) || data.Responsable_Id <= 0)) {
        errors.push('ID de responsable inválido');
    }

    // Validar estado (opcional, debe ser booleano)
    if (data.Bodega_Estado !== undefined && typeof data.Bodega_Estado !== 'boolean') {
        errors.push('El estado debe ser verdadero o falso');
    }

    return errors;
};

/**
 * Verifica si un usuario existe y está activo
 */
const verifyUserExists = async (userId) => {
    if (!userId) return true; // Es opcional

    try {
        const [users] = await db.execute(
            'SELECT Usuario_Id FROM Usuarios WHERE Usuario_Id = ? AND Usuario_Estado = 1',
            [userId]
        );
        return users.length > 0;
    } catch (error) {
        return false;
    }
};

/**
 * Crea una nueva bodega
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.createBodega = async (req, res) => {
    try {
        const bodegaData = req.body;

        // Validar datos
        const validationErrors = validateBodegaData(bodegaData);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: validationErrors
            });
        }

        // Verificar que el usuario responsable existe si se proporciona
        if (bodegaData.Responsable_Id) {
            const userExists = await verifyUserExists(bodegaData.Responsable_Id);
            if (!userExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario responsable no existe o está inactivo'
                });
            }
        }

        // Crear bodega
        const bodegaId = await BodegaModel.create(bodegaData);

        // Obtener la bodega creada con datos completos
        const bodega = await BodegaModel.findById(bodegaId);

        res.status(201).json({
            success: true,
            message: 'Bodega creada exitosamente',
            data: bodega
        });

    } catch (error) {
        console.error('Error al crear bodega:', error);
        
        if (error.message === 'Ya existe una bodega con ese nombre') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtiene todas las bodegas con paginación opcional
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAllBodegas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const tipo = req.query.tipo || '';
        const estado = req.query.estado || '';

        let bodegas;

        if (req.query.paginate === 'true') {
            const offset = (page - 1) * limit;
            const result = await BodegaModel.findWithPagination(offset, limit, search, tipo, estado);
            
            bodegas = {
                data: result.data,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(result.total / limit),
                    totalItems: result.total,
                    itemsPerPage: limit,
                    hasNextPage: page < Math.ceil(result.total / limit),
                    hasPreviousPage: page > 1
                }
            };
        } else {
            const data = await BodegaModel.findAll();
            bodegas = { data };
        }

        res.json({
            success: true,
            message: 'Bodegas obtenidas exitosamente',
            ...bodegas
        });

    } catch (error) {
        console.error('Error al obtener bodegas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtiene una bodega por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getBodegaById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de bodega inválido'
            });
        }

        const bodega = await BodegaModel.findById(id);

        if (!bodega) {
            return res.status(404).json({
                success: false,
                message: 'Bodega no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Bodega obtenida exitosamente',
            data: bodega
        });

    } catch (error) {
        console.error('Error al obtener bodega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Actualiza una bodega
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updateBodega = async (req, res) => {
    try {
        const { id } = req.params;
        const bodegaData = req.body;

        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de bodega inválido'
            });
        }

        // Verificar que la bodega existe
        const existingBodega = await BodegaModel.findById(id);
        if (!existingBodega) {
            return res.status(404).json({
                success: false,
                message: 'Bodega no encontrada'
            });
        }

        // Validar datos
        const validationErrors = validateBodegaData(bodegaData, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: validationErrors
            });
        }

        // Verificar que el usuario responsable existe si se proporciona
        if (bodegaData.Responsable_Id) {
            const userExists = await verifyUserExists(bodegaData.Responsable_Id);
            if (!userExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El usuario responsable no existe o está inactivo'
                });
            }
        }

        // Actualizar bodega
        const updated = await BodegaModel.update(id, bodegaData);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la bodega'
            });
        }

        // Obtener la bodega actualizada
        const bodega = await BodegaModel.findById(id);

        res.json({
            success: true,
            message: 'Bodega actualizada exitosamente',
            data: bodega
        });

    } catch (error) {
        console.error('Error al actualizar bodega:', error);
        
        if (error.message === 'Ya existe una bodega con ese nombre') {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Elimina una bodega (soft delete)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.deleteBodega = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de bodega inválido'
            });
        }

        // Verificar que la bodega existe
        const bodega = await BodegaModel.findById(id);
        if (!bodega) {
            return res.status(404).json({
                success: false,
                message: 'Bodega no encontrada'
            });
        }

        // Verificar si la bodega puede ser eliminada (sin existencias)
        const canDelete = await BodegaModel.canDelete(id);
        if (!canDelete) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la bodega porque tiene existencias activas'
            });
        }

        // Eliminar bodega
        const deleted = await BodegaModel.delete(id);

        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la bodega'
            });
        }

        res.json({
            success: true,
            message: 'Bodega eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar bodega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Restaura una bodega eliminada
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.restoreBodega = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar ID
        if (isNaN(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de bodega inválido'
            });
        }

        // Verificar que la bodega existe
        const bodega = await BodegaModel.findById(id);
        if (!bodega) {
            return res.status(404).json({
                success: false,
                message: 'Bodega no encontrada'
            });
        }

        // Verificar que la bodega está inactiva
        if (bodega.Bodega_Estado) {
            return res.status(400).json({
                success: false,
                message: 'La bodega ya está activa'
            });
        }

        // Restaurar bodega
        const restored = await BodegaModel.restore(id);

        if (!restored) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo restaurar la bodega'
            });
        }

        // Obtener la bodega restaurada
        const restoredBodega = await BodegaModel.findById(id);

        res.json({
            success: true,
            message: 'Bodega restaurada exitosamente',
            data: restoredBodega
        });

    } catch (error) {
        console.error('Error al restaurar bodega:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Busca bodegas por término
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.searchBodegas = async (req, res) => {
    try {
        const { term } = req.query;

        if (!term || term.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Término de búsqueda requerido'
            });
        }

        const bodegas = await BodegaModel.search(term.trim());

        res.json({
            success: true,
            message: 'Búsqueda completada exitosamente',
            data: bodegas
        });

    } catch (error) {
        console.error('Error al buscar bodegas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtiene estadísticas de bodegas
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getBodegaStats = async (req, res) => {
    try {
        const stats = await BodegaModel.getStats();

        res.json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: stats
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtiene bodegas activas para selects
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getActiveBodegas = async (req, res) => {
    try {
        const bodegas = await BodegaModel.getActiveBodegas();

        res.json({
            success: true,
            message: 'Bodegas activas obtenidas exitosamente',
            data: bodegas
        });

    } catch (error) {
        console.error('Error al obtener bodegas activas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Obtiene bodegas de un responsable específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getBodegasByResponsable = async (req, res) => {
    try {
        const { responsableId } = req.params;

        // Validar ID
        if (isNaN(responsableId) || responsableId <= 0) {
            return res.status(400).json({
                success: false,
                message: 'ID de responsable inválido'
            });
        }

        const bodegas = await BodegaModel.findByResponsable(responsableId);

        res.json({
            success: true,
            message: 'Bodegas del responsable obtenidas exitosamente',
            data: bodegas
        });

    } catch (error) {
        console.error('Error al obtener bodegas por responsable:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
