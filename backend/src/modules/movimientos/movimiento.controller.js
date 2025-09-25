const MovimientoModel = require('./movimiento.model');

class MovimientoController {

    // =======================================
    // ENDPOINTS DE CONSULTA
    // =======================================

    /**
     * Obtener todos los movimientos sin paginación (para DataTable frontend)
     */
    static async getAllMovimientos(req, res) {
        try {
            const filters = {
                tipo_movimiento: req.query.tipo_movimiento,
                bodega_id: req.query.bodega_id,
                usuario_id: req.query.usuario_id,
                fecha_inicio: req.query.fecha_inicio,
                fecha_fin: req.query.fecha_fin,
                item_id: req.query.item_id,
                search: req.query.search
            };

            const movimientos = await MovimientoModel.findAll(filters);

            res.json({
                success: true,
                data: movimientos,
                total: movimientos.length,
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
     * Obtener movimientos con paginación (endpoint opcional)
     */
    static async getMovimientosWithPagination(req, res) {
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
            console.error('Error obteniendo movimientos con paginación:', error);
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
        try {/* Lines 505-545 omitted */} catch (error) {/* Lines 547-553 omitted */}
    }

    // =======================================
    // GENERACIÓN DE DOCUMENTOS PDF
    // =======================================

    /**
     * Generar ticket PDF para imprimir en impresoras térmicas de 58mm
     */
    static async generarTicketPDF(req, res) {
        try {
            const { movimiento, items, tipo, bodegas, usuario, totales } = req.body;

            // Validaciones básicas
            if (!movimiento || !items || !tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan datos requeridos para generar el ticket'
                });
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un item'
                });
            }

            // Importar PDFKit
            const PDFDocument = require('pdfkit');
            
            // Crear documento PDF con tamaño optimizado para tickets térmicos 58mm
            const doc = new PDFDocument({
                size: [164.57, 841.89], // 58mm x 297mm en puntos
                margins: {
                    top: 8,
                    bottom: 8,
                    left: 8,
                    right: 8
                }
            });

            // Configurar respuesta HTTP
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="ticket-${tipo}-${Date.now()}.pdf"`);
            res.setHeader('Cache-Control', 'no-cache');

            // Enviar PDF al response
            doc.pipe(res);

            // ===== ENCABEZADO MEJORADO =====
            
            // Línea superior
            doc.fontSize(8)
               .text('================================', { align: 'center' })
               .moveDown(0.2);

            // Logo y nombre empresa
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('KARDEX PLUS', { align: 'center' })
               .moveDown(0.1);

            doc.fontSize(8)
               .font('Helvetica')
               .text('Sistema de Inventario Inteligente', { align: 'center' })
               .moveDown(0.3);

            // Línea divisoria
            doc.text('================================', { align: 'center' })
               .moveDown(0.3);

            // Tipo de movimiento con mejor formato
            const tiposTexto = {
                entrada: 'ENTRADA DE INVENTARIO',
                salida: 'SALIDA DE INVENTARIO', 
                transferencia: 'TRANSFERENCIA ENTRE BODEGAS',
                ajuste: 'AJUSTE DE INVENTARIO'
            };

            doc.fontSize(11)
               .font('Helvetica-Bold')
               .text(tiposTexto[tipo] || 'MOVIMIENTO DE INVENTARIO', { 
                   align: 'center',
                   width: 148
               })
               .moveDown(0.2);

            // Número de comprobante más visible
            const numeroComprobante = `${tipo.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`;
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .text(`No. ${numeroComprobante}`, { 
                   align: 'center'
               })
               .moveDown(0.4);

            // Línea divisoria mejorada
            doc.fontSize(8)
               .font('Helvetica')
               .text('================================', { align: 'center' })
               .moveDown(0.4);

            // ===== INFORMACIÓN DEL MOVIMIENTO MEJORADA =====
            doc.fontSize(8)
               .font('Helvetica');

            const fechaActual = new Date().toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Información en formato más estructurado
            doc.text('INFORMACIÓN GENERAL', { align: 'center', underline: true })
               .moveDown(0.2);

            doc.text(`Fecha: ${fechaActual}`, { width: 148 })
               .text(`Responsable: ${usuario || 'Sistema'}`, { width: 148 })
               .moveDown(0.1);

            if (movimiento.Recepcionista && movimiento.Recepcionista !== 'da') {
                doc.text(`Recepcionista: ${movimiento.Recepcionista}`, { width: 148 });
            }

            if (movimiento.Motivo && movimiento.Motivo !== 'Devolución') {
                doc.text(`Motivo: ${movimiento.Motivo}`, { width: 148 });
            }

            // Información de bodegas
            const getBodegaNombre = (id) => {
                if (!bodegas || !Array.isArray(bodegas)) return 'No especificada';
                const bodega = bodegas.find(b => b.Bodega_Id === parseInt(id));
                return bodega?.Bodega_Nombre || 'No especificada';
            };

            if (movimiento.Origen_Bodega_Id) {
                doc.text(`Origen: ${getBodegaNombre(movimiento.Origen_Bodega_Id)}`);
            }

            if (movimiento.Destino_Bodega_Id) {
                doc.text(`Destino: ${getBodegaNombre(movimiento.Destino_Bodega_Id)}`);
            }

            doc.moveDown(0.3);

            // Línea divisoria para items
            doc.text('--------------------------------', { align: 'center' })
               .moveDown(0.2);

            // ===== DETALLE DE ITEMS MEJORADO =====
            doc.fontSize(10)
               .font('Helvetica-Bold')
               .text('DETALLE DE ITEMS', { align: 'center' })
               .moveDown(0.2);

            doc.fontSize(8)
               .font('Helvetica')
               .text('--------------------------------', { align: 'center' })
               .moveDown(0.3);

            // Listar items con mejor formato
            items.forEach((item, index) => {
                // Nombre del item más prominente
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .text(`${index + 1}. ${item.Item_Descripcion || item.Item_Nombre}`, { 
                       width: 148, 
                       lineGap: 2
                   })
                   .moveDown(0.1);

                // Información del item en líneas separadas
                doc.fontSize(7)
                   .font('Helvetica')
                   .text(`    Código: ${item.Item_Codigo || item.Item_Id}`, { width: 148 })
                   .text(`    ID: ${item.Item_Id}`, { width: 148 });

                // Mostrar cantidad - verificar si hay presentación
                if (item.Es_Movimiento_Por_Presentacion && item.Cantidad_Presentacion) {
                    // Item con presentación
                    const cantidadPresentacion = parseFloat(item.Cantidad_Presentacion).toLocaleString('es-ES');
                    const cantidadBase = parseFloat(item.Cantidad).toLocaleString('es-ES');
                    const unidadBase = item.UnidadMedida_Prefijo || item.Item_Unidad_Medida || 'Und';
                    const nombrePresentacion = item.Presentacion_Nombre || 'unidades';
                    
                    doc.fontSize(8)
                       .font('Helvetica-Bold')
                       .text(`    Cantidad: ${cantidadPresentacion} ${nombrePresentacion}`, { width: 148 });
                    
                    doc.fontSize(7)
                       .font('Helvetica')
                       .text(`    (= ${cantidadBase} ${unidadBase})`, { width: 148 });
                    
                    // Mostrar factor de conversión si está disponible
                    if (item.Factor_Conversion) {
                        doc.fontSize(6)
                           .text(`    Factor: ${item.Factor_Conversion}x`, { width: 148 });
                    }
                } else {
                    // Item normal (sin presentación)
                    const cantidad = parseFloat(item.Cantidad).toLocaleString('es-ES');
                    const unidad = item.UnidadMedida_Prefijo || item.Item_Unidad_Medida || 'Und';
                    
                    doc.fontSize(8)
                       .font('Helvetica-Bold')
                       .text(`    Cantidad: ${cantidad} ${unidad}`, { width: 148 });
                }

                // Precio si existe
                if (item.Precio_Unitario && parseFloat(item.Precio_Unitario) > 0) {
                    const precio = parseFloat(item.Precio_Unitario).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    const subtotal = (parseFloat(item.Precio_Unitario) * parseFloat(item.Cantidad)).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                    
                    doc.fontSize(7)
                       .text(`    Precio unit: $${precio}`, { width: 148 })
                       .text(`    Subtotal: $${subtotal}`, { width: 148 });
                }

                // Separador entre items
                if (index < items.length - 1) {
                    doc.moveDown(0.2)
                       .fontSize(7)
                       .text('- - - - - - - - - - - - - - - -', { align: 'center' })
                       .moveDown(0.2);
                } else {
                    doc.moveDown(0.3);
                }
            });

            // Línea divisoria antes de totales
            doc.fontSize(8)
               .text('--------------------------------', { align: 'center' })
               .moveDown(0.3);

            // ===== TOTALES MEJORADOS =====
            if (totales) {
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .text('RESUMEN', { align: 'center' })
                   .moveDown(0.2);

                doc.fontSize(8)
                   .font('Helvetica')
                   .text(`Items diferentes: ${totales.totalItems || items.length}`, { width: 148 })
                   .text(`Cantidad total: ${totales.cantidadTotal?.toLocaleString('es-ES') || 'N/A'}`, { width: 148 });

                // Mostrar estadísticas de presentaciones si existen
                const itemsConPresentacion = items.filter(item => item.Es_Movimiento_Por_Presentacion);
                const itemsUnidadBase = items.filter(item => !item.Es_Movimiento_Por_Presentacion);
                
                if (itemsConPresentacion.length > 0 || itemsUnidadBase.length > 0) {
                    doc.moveDown(0.1)
                       .fontSize(7)
                       .text('- - - - - - - - - - - - -', { align: 'center' });
                    
                    if (itemsConPresentacion.length > 0) {
                        doc.text(`• Con presentación: ${itemsConPresentacion.length}`, { width: 148 });
                    }
                    
                    if (itemsUnidadBase.length > 0) {
                        doc.text(`• Unidad base: ${itemsUnidadBase.length}`, { width: 148 });
                    }
                }

                if (totales.valorTotal && totales.valorTotal > 0) {
                    doc.moveDown(0.2)
                       .fontSize(10)
                       .font('Helvetica-Bold')
                       .text(`VALOR TOTAL: $${totales.valorTotal.toLocaleString('es-ES', {
                           minimumFractionDigits: 2,
                           maximumFractionDigits: 2
                       })}`, { align: 'center' });
                }
            }

            // Observaciones si existen y no están vacías
            if (movimiento.Observaciones && movimiento.Observaciones !== 'da' && movimiento.Observaciones.trim() !== '') {
                doc.moveDown(0.4)
                   .fontSize(8)
                   .text('--------------------------------', { align: 'center' })
                   .moveDown(0.2);

                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .text('OBSERVACIONES', { align: 'center' })
                   .moveDown(0.2);

                doc.fontSize(8)
                   .font('Helvetica')
                   .text(movimiento.Observaciones, { 
                       align: 'left',
                       width: 148,
                       lineGap: 1
                   });
            }

            doc.moveDown(0.5)
               .fontSize(8)
               .text('================================', { align: 'center' })
               .moveDown(0.3);

            // ===== PIE MEJORADO =====
            doc.fontSize(7)
               .font('Helvetica')
               .text('Documento generado automáticamente', { align: 'center' })
               .text('por KardexPlus v1.0', { align: 'center' })
               .moveDown(0.1)
               .text('Conserve este comprobante', { align: 'center' })
               .moveDown(0.2)
               .text('================================', { align: 'center' })
               .moveDown(0.3)
               .fontSize(6)
               .text(`Generado: ${fechaActual}`, { align: 'center' });

            // Finalizar documento
            doc.end();

        } catch (error) {
            console.error('Error generando ticket PDF:', error);
            
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error interno al generar el ticket',
                    error: error.message
                });
            }
        }
    }
}

module.exports = MovimientoController;

module.exports = MovimientoController;