const MovimientoModel = require('./movimiento.model');

class MovimientoController {

    // =======================================
    // ENDPOINTS DE CONSULTA
    // =======================================

    /**
     * Obtener todos los movimientos con paginación y filtros
     */
    static async getAllMovimientos(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            if (isNaN(page) || page < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Número de página inválido'
                });
            }

            if (isNaN(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Límite inválido (1-100)'
                });
            }

            const offset = (page - 1) * limit;

            const filters = {
                tipo_movimiento: req.query.tipo_movimiento,
                bodega_id: req.query.bodega_id,
                usuario_id: req.query.usuario_id,
                fecha_inicio: req.query.fecha_inicio,
                fecha_fin: req.query.fecha_fin,
                item_id: req.query.item_id,
                search: req.query.search
            };

            const result = await MovimientoModel.findWithPagination(offset, limit, filters);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Movimientos obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo movimientos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener movimiento por ID con detalle completo
     */
    static async getMovimientoById(req, res) {
        try {
            const { movimientoId } = req.params;

            if (!movimientoId || isNaN(movimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de movimiento inválido'
                });
            }

            const movimiento = await MovimientoModel.findById(parseInt(movimientoId));

            if (!movimiento) {
                return res.status(404).json({
                    success: false,
                    message: 'Movimiento no encontrado'
                });
            }

            res.json({
                success: true,
                data: movimiento,
                message: 'Movimiento obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo movimiento por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener kardex de un item específico
     */
    static async getKardexItem(req, res) {
        try {
            const { itemId } = req.params;
            const { bodega_id, fecha_inicio, fecha_fin } = req.query;

            if (!itemId || isNaN(itemId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de item inválido'
                });
            }

            const kardex = await MovimientoModel.getKardexItem(
                parseInt(itemId),
                bodega_id ? parseInt(bodega_id) : null,
                fecha_inicio,
                fecha_fin
            );

            res.json({
                success: true,
                data: kardex,
                message: 'Kardex obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo kardex:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener resumen de movimientos por período
     */
    static async getResumenPorPeriodo(req, res) {
        try {
            const { fecha_inicio, fecha_fin, tipo_movimiento } = req.query;

            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Las fechas de inicio y fin son requeridas'
                });
            }

            const resumen = await MovimientoModel.getResumenPorPeriodo(
                fecha_inicio,
                fecha_fin,
                tipo_movimiento
            );

            res.json({
                success: true,
                data: resumen,
                message: 'Resumen obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo resumen por período:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE CREACIÓN DE MOVIMIENTOS
    // =======================================

    /**
     * Crear movimiento de entrada
     */
    static async crearEntrada(req, res) {
        try {
            const { movimiento, items } = req.body;

            // Validaciones básicas
            if (!movimiento || !items) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos del movimiento e items son requeridos'
                });
            }

            if (!movimiento.Destino_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'La bodega de destino es requerida'
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item'
                });
            }

            // Agregar el usuario actual al movimiento
            movimiento.Usuario_Id = req.user.id; // Del middleware de autenticación

            const movimientoId = await MovimientoModel.crearEntrada(movimiento, items);

            res.status(201).json({
                success: true,
                data: { movimiento_id: movimientoId },
                message: 'Entrada creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando entrada:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear movimiento de salida
     */
    static async crearSalida(req, res) {
        try {
            const { movimiento, items } = req.body;

            // Validaciones básicas
            if (!movimiento || !items) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos del movimiento e items son requeridos'
                });
            }

            if (!movimiento.Origen_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'La bodega de origen es requerida'
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item'
                });
            }

            // Agregar el usuario actual al movimiento
            movimiento.Usuario_Id = req.user.id;

            const movimientoId = await MovimientoModel.crearSalida(movimiento, items);

            res.status(201).json({
                success: true,
                data: { movimiento_id: movimientoId },
                message: 'Salida creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando salida:', error);
            
            // Manejar errores específicos de stock
            if (error.message.includes('Stock insuficiente')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    error_type: 'STOCK_INSUFICIENTE'
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
     * Crear movimiento de transferencia
     */
    static async crearTransferencia(req, res) {
        try {
            const { movimiento, items } = req.body;

            // Validaciones básicas
            if (!movimiento || !items) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos del movimiento e items son requeridos'
                });
            }

            if (!movimiento.Origen_Bodega_Id || !movimiento.Destino_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'Las bodegas de origen y destino son requeridas'
                });
            }

            if (movimiento.Origen_Bodega_Id === movimiento.Destino_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'Las bodegas de origen y destino deben ser diferentes'
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item'
                });
            }

            // Agregar el usuario actual al movimiento
            movimiento.Usuario_Id = req.user.id;

            const movimientoId = await MovimientoModel.crearTransferencia(movimiento, items);

            res.status(201).json({
                success: true,
                data: { movimiento_id: movimientoId },
                message: 'Transferencia creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando transferencia:', error);
            
            // Manejar errores específicos de stock
            if (error.message.includes('Stock insuficiente')) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                    error_type: 'STOCK_INSUFICIENTE'
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
     * Crear movimiento de ajuste
     */
    static async crearAjuste(req, res) {
        try {
            const { movimiento, items } = req.body;

            // Validaciones básicas
            if (!movimiento || !items) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos del movimiento e items son requeridos'
                });
            }

            if (!movimiento.Destino_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'La bodega es requerida para ajustes'
                });
            }

            if (!movimiento.Motivo) {
                return res.status(400).json({
                    success: false,
                    message: 'El motivo es obligatorio para ajustes'
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item'
                });
            }

            // Agregar el usuario actual al movimiento
            movimiento.Usuario_Id = req.user.id;

            const movimientoId = await MovimientoModel.crearAjuste(movimiento, items);

            res.status(201).json({
                success: true,
                data: { movimiento_id: movimientoId },
                message: 'Ajuste creado exitosamente'
            });

        } catch (error) {
            console.error('Error creando ajuste:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Aprobar movimiento (cambiar estado o procesar)
     */
    static async aprobarMovimiento(req, res) {
        try {
            const { movimientoId } = req.params;
            const { observaciones } = req.body;

            if (!movimientoId || isNaN(movimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de movimiento inválido'
                });
            }

            // Obtener el movimiento para verificar que existe
            const movimiento = await MovimientoModel.findById(parseInt(movimientoId));

            if (!movimiento) {
                return res.status(404).json({
                    success: false,
                    message: 'Movimiento no encontrado'
                });
            }

            // Aquí podrías agregar lógica adicional para aprobación
            // Por ejemplo, cambiar un campo de estado si existiera
            
            res.json({
                success: true,
                message: 'Movimiento aprobado exitosamente',
                data: { movimiento_id: movimientoId }
            });

        } catch (error) {
            console.error('Error aprobando movimiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS ESPECIALIZADOS
    // =======================================

    /**
     * Obtener stock actual de un item en una bodega
     */
    static async getStockActual(req, res) {
        try {
            const { itemId, bodegaId } = req.params;

            if (!itemId || isNaN(itemId) || !bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs de item y bodega son requeridos y deben ser válidos'
                });
            }

            const stock = await MovimientoModel.getStockActual(
                parseInt(itemId),
                parseInt(bodegaId)
            );

            res.json({
                success: true,
                data: { 
                    item_id: parseInt(itemId),
                    bodega_id: parseInt(bodegaId),
                    stock_actual: stock 
                },
                message: 'Stock actual obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo stock actual:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Validar disponibilidad de stock antes de crear movimiento
     */
    static async validarStock(req, res) {
        try {
            const { bodega_id, items } = req.body;

            if (!bodega_id || !items || !Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Bodega ID e items son requeridos'
                });
            }

            const validaciones = [];

            for (const item of items) {
                if (!item.Item_Id || !item.Cantidad) {
                    continue;
                }

                const stockActual = await MovimientoModel.getStockActual(
                    item.Item_Id,
                    bodega_id
                );

                validaciones.push({
                    item_id: item.Item_Id,
                    cantidad_solicitada: item.Cantidad,
                    stock_actual: stockActual,
                    disponible: stockActual >= item.Cantidad,
                    faltante: stockActual < item.Cantidad ? item.Cantidad - stockActual : 0
                });
            }

            const todosDisponibles = validaciones.every(v => v.disponible);

            res.json({
                success: true,
                data: {
                    todos_disponibles: todosDisponibles,
                    validaciones: validaciones
                },
                message: 'Validación de stock completada'
            });

        } catch (error) {
            console.error('Error validando stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = MovimientoController;