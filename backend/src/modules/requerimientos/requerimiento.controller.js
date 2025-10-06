const RequerimientoModel = require('./requerimiento.model');

class RequerimientoController {

    // =======================================
    // ENDPOINTS DE CONSULTA
    // =======================================

    /**
     * Obtener todos los requerimientos sin paginación (para DataTable frontend)
     */
    static async getAllRequerimientos(req, res) {
        try {
            const filters = {
                estado: req.query.estado,
                bodega_id: req.query.bodega_id,
                origen_bodega_id: req.query.origen_bodega_id,
                destino_bodega_id: req.query.destino_bodega_id,
                usuario_solicita_id: req.query.usuario_solicita_id,
                usuario_despacha_id: req.query.usuario_despacha_id,
                fecha_inicio: req.query.fecha_inicio,
                fecha_fin: req.query.fecha_fin,
                item_id: req.query.item_id,
                search: req.query.search
            };

            const requerimientos = await RequerimientoModel.findAll(filters);

            res.json({
                success: true,
                data: requerimientos,
                total: requerimientos.length,
                message: 'Requerimientos obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo requerimientos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener requerimiento por ID con detalle completo
     * Incluye validación de permisos contextuales y metadata de acciones disponibles
     */
    static async getRequerimientoById(req, res) {
        try {
            const { requerimientoId } = req.params;
            const usuarioId = req.user.id;

            if (!requerimientoId || isNaN(requerimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de requerimiento inválido'
                });
            }

            const requerimiento = await RequerimientoModel.findByIdWithPermissions(parseInt(requerimientoId), usuarioId);

            if (!requerimiento) {
                return res.status(404).json({
                    success: false,
                    message: 'Requerimiento no encontrado'
                });
            }

            // Verificar si el usuario tiene acceso a este requerimiento
            if (!requerimiento.permisos_usuario.puede_ver) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este requerimiento'
                });
            }

            res.json({
                success: true,
                data: requerimiento.requerimiento,
                permisos_usuario: requerimiento.permisos_usuario,
                acciones_disponibles: requerimiento.acciones_disponibles,
                message: 'Requerimiento obtenido exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo requerimiento por ID:', error);
            
            if (error.message.includes('No tienes permisos')) {
                return res.status(403).json({
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
     * Obtener requerimientos por estado
     */
    static async getRequerimientosByEstado(req, res) {
        try {
            const { estado } = req.params;

            const estadosValidos = ['Pendiente', 'Aprobado', 'En_Despacho', 'Completado', 'Parcialmente_Despachado', 'Rechazado', 'Cancelado'];
            
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado de requerimiento inválido'
                });
            }

            const filters = {
                estado: estado
            };

            const requerimientos = await RequerimientoModel.findAll(filters);

            res.json({
                success: true,
                data: requerimientos,
                message: `Requerimientos con estado ${estado} obtenidos exitosamente`
            });

        } catch (error) {
            console.error('Error obteniendo requerimientos por estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de requerimientos
     */
    static async getEstadisticas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            const estadisticas = await RequerimientoModel.getEstadisticas(fecha_inicio, fecha_fin);

            res.json({
                success: true,
                data: estadisticas,
                message: 'Estadísticas obtenidas exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE CREACIÓN DE REQUERIMIENTOS
    // =======================================

    /**
     * Crear nuevo requerimiento
     */
    static async crearRequerimiento(req, res) {
        try {
            const { requerimiento, items } = req.body;

            // Validaciones básicas
            if (!requerimiento || !items) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos del requerimiento y los items son requeridos'
                });
            }

            if (!requerimiento.Origen_Bodega_Id || !requerimiento.Destino_Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'Las bodegas de origen y destino son requeridas'
                });
            }

            if (requerimiento.Origen_Bodega_Id === requerimiento.Destino_Bodega_Id) {
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

            // Agregar el usuario actual al requerimiento
            requerimiento.Usuario_Solicita_Id = req.user.id; // Del middleware de autenticación

            const requerimientoId = await RequerimientoModel.crear(requerimiento, items);

            res.status(201).json({
                success: true,
                data: { requerimiento_id: requerimientoId },
                message: 'Requerimiento creado exitosamente'
            });

        } catch (error) {
            console.error('Error creando requerimiento:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE APROBACIÓN Y GESTIÓN
    // =======================================

    /**
     * Aprobar requerimiento
     */
    static async aprobarRequerimiento(req, res) {
        try {
            const { requerimientoId } = req.params;

            if (!requerimientoId || isNaN(requerimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de requerimiento inválido'
                });
            }

            const usuarioApruebaId = req.user.id; // Del middleware de autenticación

            await RequerimientoModel.aprobar(parseInt(requerimientoId), usuarioApruebaId);

            res.json({
                success: true,
                message: 'Requerimiento aprobado exitosamente',
                data: { requerimiento_id: requerimientoId }
            });

        } catch (error) {
            console.error('Error aprobando requerimiento:', error);
            
            if (error.message.includes('no encontrado') || error.message.includes('pendientes')) {
                return res.status(400).json({
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
     * Rechazar requerimiento
     */
    static async rechazarRequerimiento(req, res) {
        try {
            const { requerimientoId } = req.params;
            const { observaciones } = req.body;

            if (!requerimientoId || isNaN(requerimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de requerimiento inválido'
                });
            }

            if (!observaciones || observaciones.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Las observaciones del rechazo son requeridas'
                });
            }

            const usuarioApruebaId = req.user.id; // Del middleware de autenticación

            await RequerimientoModel.rechazar(parseInt(requerimientoId), usuarioApruebaId, observaciones);

            res.json({
                success: true,
                message: 'Requerimiento rechazado exitosamente',
                data: { requerimiento_id: requerimientoId }
            });

        } catch (error) {
            console.error('Error rechazando requerimiento:', error);
            
            if (error.message.includes('no encontrado') || error.message.includes('pendientes')) {
                return res.status(400).json({
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
     * Despachar requerimiento (total o parcialmente)
     */
    static async despacharRequerimiento(req, res) {
        try {
            const { requerimientoId } = req.params;
            const { items, observaciones_despacho } = req.body;

            if (!requerimientoId || isNaN(requerimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de requerimiento inválido'
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item para despachar'
                });
            }

            const usuarioDespachaId = req.user.id; // Del middleware de autenticación

            const resultado = await RequerimientoModel.despachar(
                parseInt(requerimientoId), 
                usuarioDespachaId, 
                items, 
                observaciones_despacho || ''
            );

            // Mensaje personalizado según si se creó movimiento o no
            let mensaje = 'Requerimiento despachado exitosamente';
            if (resultado.movimientoId) {
                mensaje += `. Transferencia #${resultado.movimientoId} creada automáticamente`;
            } else if (resultado.errorMovimiento) {
                mensaje += `. ⚠️ ADVERTENCIA: El despacho fue registrado pero NO se pudo crear el movimiento de transferencia`;
            }

            res.json({
                success: true,
                message: mensaje,
                data: {
                    requerimiento_id: resultado.requerimientoId,
                    nuevo_estado: resultado.nuevoEstado,
                    movimiento_id: resultado.movimientoId,
                    items_despachados: resultado.itemsDespachados,
                    // IMPORTANTE: Incluir información del error de movimiento si lo hay
                    warning_movimiento: resultado.errorMovimiento ? {
                        error: resultado.errorMovimiento,
                        descripcion: 'El requerimiento fue despachado correctamente, pero no se pudo crear el movimiento de transferencia automático debido a restricciones de stock'
                    } : null
                }
            });

        } catch (error) {
            console.error('Error despachando requerimiento:', error);
            
            if (error.message.includes('no encontrado') || 
                error.message.includes('aprobados') || 
                error.message.includes('Stock insuficiente') ||
                error.message.includes('excede')) {
                return res.status(400).json({
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
     * Cancelar requerimiento
     */
    static async cancelarRequerimiento(req, res) {
        try {
            const { requerimientoId } = req.params;
            const { observaciones } = req.body;

            if (!requerimientoId || isNaN(requerimientoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de requerimiento inválido'
                });
            }

            if (!observaciones || observaciones.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Las observaciones de la cancelación son requeridas'
                });
            }

            const usuarioId = req.user.id; // Del middleware de autenticación

            await RequerimientoModel.cancelar(parseInt(requerimientoId), usuarioId, observaciones);

            res.json({
                success: true,
                message: 'Requerimiento cancelado exitosamente',
                data: { requerimiento_id: requerimientoId }
            });

        } catch (error) {
            console.error('Error cancelando requerimiento:', error);
            
            if (error.message.includes('no encontrado') || error.message.includes('cancelar')) {
                return res.status(400).json({
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

    // =======================================
    // ENDPOINTS ESPECIALIZADOS
    // =======================================

    /**
     * Obtener requerimientos de una bodega específica
     */
    static async getRequerimientosByBodega(req, res) {
        try {
            const { bodegaId } = req.params;
            const { tipo } = req.query; // 'origen' o 'destino'

            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            const tipoValido = ['origen', 'destino'].includes(tipo) ? tipo : 'destino';
            
            const requerimientos = await RequerimientoModel.findByBodega(parseInt(bodegaId), tipoValido);

            res.json({
                success: true,
                data: requerimientos,
                message: `Requerimientos de bodega ${tipoValido} obtenidos exitosamente`
            });

        } catch (error) {
            console.error('Error obteniendo requerimientos por bodega:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener requerimientos pendientes de aprobación
     */
    static async getRequerimientosPendientes(req, res) {
        try {
            const filters = {
                estado: 'Pendiente'
            };

            const requerimientos = await RequerimientoModel.findAll(filters);

            res.json({
                success: true,
                data: requerimientos,
                message: 'Requerimientos pendientes obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo requerimientos pendientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener requerimientos aprobados para despacho
     */
    static async getRequerimientosParaDespacho(req, res) {
        try {
            const filters = {
                estado: 'Aprobado'
            };

            // Si se especifica una bodega, filtrar por bodega origen
            if (req.query.bodega_id) {
                filters.origen_bodega_id = req.query.bodega_id;
            }

            const requerimientos = await RequerimientoModel.findAll(filters);

            res.json({
                success: true,
                data: requerimientos,
                message: 'Requerimientos para despacho obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo requerimientos para despacho:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener mis requerimientos (del usuario autenticado)
     */
    static async getMisRequerimientos(req, res) {
        try {
            const usuarioId = req.user.id;
            
            const filters = {
                usuario_solicita_id: usuarioId
            };

            // Filtros adicionales opcionales
            if (req.query.estado) {
                filters.estado = req.query.estado;
            }

            if (req.query.fecha_inicio) {
                filters.fecha_inicio = req.query.fecha_inicio;
            }

            if (req.query.fecha_fin) {
                filters.fecha_fin = req.query.fecha_fin;
            }

            const requerimientos = await RequerimientoModel.findAll(filters);

            res.json({
                success: true,
                data: requerimientos,
                message: 'Mis requerimientos obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo mis requerimientos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE VALIDACIÓN
    // =======================================

    /**
     * Validar si se puede crear un requerimiento
     */
    static async validarCreacion(req, res) {
        try {
            const { origen_bodega_id, destino_bodega_id, items } = req.body;

            const validaciones = {
                bodegas_diferentes: origen_bodega_id !== destino_bodega_id,
                tiene_items: items && Array.isArray(items) && items.length > 0,
                items_validos: true
            };

            if (validaciones.tiene_items) {
                for (const item of items) {
                    if (!item.Item_Id || !item.Cantidad_Solicitada || item.Cantidad_Solicitada <= 0) {
                        validaciones.items_validos = false;
                        break;
                    }
                }
            }

            const esValido = Object.values(validaciones).every(v => v === true);

            res.json({
                success: true,
                data: {
                    es_valido: esValido,
                    validaciones
                },
                message: 'Validación de creación completada'
            });

        } catch (error) {
            console.error('Error validando creación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE REPORTES
    // =======================================

    /**
     * Generar reporte de requerimientos
     */
    static async generarReporte(req, res) {
        try {
            const { fecha_inicio, fecha_fin, estado, bodega_id } = req.query;

            const filters = {};

            if (fecha_inicio) filters.fecha_inicio = fecha_inicio;
            if (fecha_fin) filters.fecha_fin = fecha_fin;
            if (estado) filters.estado = estado;
            if (bodega_id) filters.bodega_id = bodega_id;

            const requerimientos = await RequerimientoModel.findAll(filters);
            const estadisticas = await RequerimientoModel.getEstadisticas(fecha_inicio, fecha_fin);

            res.json({
                success: true,
                data: {
                    requerimientos,
                    estadisticas,
                    resumen: {
                        total: requerimientos.length,
                        periodo: { fecha_inicio, fecha_fin }
                    }
                },
                message: 'Reporte generado exitosamente'
            });

        } catch (error) {
            console.error('Error generando reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = RequerimientoController;