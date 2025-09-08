const UnidadMedidaModel = require('./unidad-medida.model');

class UnidadMedidaController {
    /**
     * Obtiene todas las unidades de medida
     */
    static async getAllUnidadesMedida(req, res) {
        try {
            const unidades = await UnidadMedidaModel.findAll();
            
            res.json({
                success: true,
                data: unidades
            });
        } catch (error) {
            console.error('Error al obtener todas las unidades de medida:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene unidades de medida con paginación y filtros
     */
    static async getUnidadesMedidaWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search || '';
            const offset = (page - 1) * limit;

            const result = await UnidadMedidaModel.findWithPagination(offset, limit, search);
            
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
            console.error('Error al obtener unidades de medida con paginación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene una unidad de medida por ID
     */
    static async getUnidadMedidaById(req, res) {
        try {
            const { id } = req.params;
            
            // Validar que el ID sea un número
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de unidad de medida inválido'
                });
            }

            const unidad = await UnidadMedidaModel.findById(parseInt(id));
            
            if (!unidad) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidad de medida no encontrada'
                });
            }

            res.json({
                success: true,
                data: unidad
            });
        } catch (error) {
            console.error('Error al obtener unidad de medida:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crea una nueva unidad de medida
     */
    static async createUnidadMedida(req, res) {
        try {
            const { UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion } = req.body;
            
            // Validaciones
            if (!UnidadMedida_Nombre || UnidadMedida_Nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la unidad de medida es requerido'
                });
            }

            if (!UnidadMedida_Prefijo || UnidadMedida_Prefijo.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El prefijo de la unidad de medida es requerido'
                });
            }

            if (UnidadMedida_Nombre.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 100 caracteres'
                });
            }

            if (UnidadMedida_Prefijo.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: 'El prefijo no puede exceder los 10 caracteres'
                });
            }

            // Validar factor de conversión si se proporciona
            if (UnidadMedida_Factor_Conversion !== undefined && UnidadMedida_Factor_Conversion !== null) {
                const factor = parseFloat(UnidadMedida_Factor_Conversion);
                if (isNaN(factor) || factor <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'El factor de conversión debe ser un número positivo'
                    });
                }
            }

            const unidadData = {
                UnidadMedida_Nombre: UnidadMedida_Nombre.trim(),
                UnidadMedida_Prefijo: UnidadMedida_Prefijo.trim(),
                UnidadMedida_Factor_Conversion: UnidadMedida_Factor_Conversion ? parseFloat(UnidadMedida_Factor_Conversion) : null
            };

            const unidadId = await UnidadMedidaModel.create(unidadData);
            
            res.status(201).json({
                success: true,
                message: 'Unidad de medida creada exitosamente',
                data: { 
                    UnidadMedida_Id: unidadId,
                    ...unidadData
                }
            });
        } catch (error) {
            console.error('Error al crear unidad de medida:', error);
            
            // Manejar errores específicos
            if (error.message.includes('Ya existe una unidad de medida')) {
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
    }

    /**
     * Actualiza una unidad de medida
     */
    static async updateUnidadMedida(req, res) {
        try {
            const { id } = req.params;
            const { UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion } = req.body;
            
            // Validar que el ID sea un número
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de unidad de medida inválido'
                });
            }

            // Validaciones
            if (!UnidadMedida_Nombre || UnidadMedida_Nombre.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la unidad de medida es requerido'
                });
            }

            if (!UnidadMedida_Prefijo || UnidadMedida_Prefijo.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El prefijo de la unidad de medida es requerido'
                });
            }

            if (UnidadMedida_Nombre.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre no puede exceder los 100 caracteres'
                });
            }

            if (UnidadMedida_Prefijo.length > 10) {
                return res.status(400).json({
                    success: false,
                    message: 'El prefijo no puede exceder los 10 caracteres'
                });
            }

            // Validar factor de conversión si se proporciona
            if (UnidadMedida_Factor_Conversion !== undefined && UnidadMedida_Factor_Conversion !== null) {
                const factor = parseFloat(UnidadMedida_Factor_Conversion);
                if (isNaN(factor) || factor <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'El factor de conversión debe ser un número positivo'
                    });
                }
            }

            // Verificar que la unidad de medida existe
            const existingUnidad = await UnidadMedidaModel.findById(parseInt(id));
            if (!existingUnidad) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidad de medida no encontrada'
                });
            }

            const unidadData = {
                UnidadMedida_Nombre: UnidadMedida_Nombre.trim(),
                UnidadMedida_Prefijo: UnidadMedida_Prefijo.trim(),
                UnidadMedida_Factor_Conversion: UnidadMedida_Factor_Conversion ? parseFloat(UnidadMedida_Factor_Conversion) : null
            };

            const updated = await UnidadMedidaModel.update(parseInt(id), unidadData);
            
            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'No se pudo actualizar la unidad de medida'
                });
            }
            
            res.json({
                success: true,
                message: 'Unidad de medida actualizada exitosamente',
                data: {
                    UnidadMedida_Id: parseInt(id),
                    ...unidadData
                }
            });
        } catch (error) {
            console.error('Error al actualizar unidad de medida:', error);
            
            // Manejar errores específicos
            if (error.message.includes('Ya existe una unidad de medida')) {
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
    }

    /**
     * Elimina una unidad de medida
     */
    static async deleteUnidadMedida(req, res) {
        try {
            const { id } = req.params;
            
            // Validar que el ID sea un número
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de unidad de medida inválido'
                });
            }

            // Verificar que la unidad de medida existe
            const existingUnidad = await UnidadMedidaModel.findById(parseInt(id));
            if (!existingUnidad) {
                return res.status(404).json({
                    success: false,
                    message: 'Unidad de medida no encontrada'
                });
            }

            const deleted = await UnidadMedidaModel.delete(parseInt(id));
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'No se pudo eliminar la unidad de medida'
                });
            }
            
            res.json({
                success: true,
                message: 'Unidad de medida eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar unidad de medida:', error);
            
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
    }

    /**
     * Obtiene estadísticas de unidades de medida
     */
    static async getUnidadMedidaStats(req, res) {
        try {
            const totalUnidades = await UnidadMedidaModel.count();
            
            res.json({
                success: true,
                data: {
                    totalUnidades
                }
            });
        } catch (error) {
            console.error('Error al obtener estadísticas de unidades de medida:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Verifica si una unidad de medida existe
     */
    static async checkUnidadMedidaExists(req, res) {
        try {
            const { id } = req.params;
            
            // Validar que el ID sea un número
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de unidad de medida inválido'
                });
            }

            const exists = await UnidadMedidaModel.exists(parseInt(id));
            
            res.json({
                success: true,
                data: { exists }
            });
        } catch (error) {
            console.error('Error al verificar existencia de unidad de medida:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = UnidadMedidaController;
