const express = require('express');
const router = express.Router();
const MovimientoController = require('./movimiento.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

// =======================================
// RUTAS DE CONSULTA DE MOVIMIENTOS
// =======================================

// GET /api/movimientos - Obtener todos los movimientos con paginación y filtros
router.get('/', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.getAllMovimientos
);

// GET /api/movimientos/:movimientoId - Obtener movimiento por ID con detalle completo
router.get('/:movimientoId', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.getMovimientoById
);

// GET /api/movimientos/kardex/:itemId - Obtener kardex de un item específico
router.get('/kardex/:itemId', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.getKardexItem
);

// GET /api/movimientos/resumen/periodo - Obtener resumen de movimientos por período
router.get('/resumen/periodo', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.getResumenPorPeriodo
);

// GET /api/movimientos/stock/:itemId/:bodegaId - Obtener stock actual de un item en una bodega
router.get('/stock/:itemId/:bodegaId', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.getStockActual
);

// =======================================
// RUTAS DE CREACIÓN DE MOVIMIENTOS
// =======================================

// POST /api/movimientos/entradas - Crear movimiento de entrada
router.post('/entradas', 
    authMiddleware, 
    hasPermission('movimientos.crear_entrada'), 
    MovimientoController.crearEntrada
);

// POST /api/movimientos/salidas - Crear movimiento de salida
router.post('/salidas', 
    authMiddleware, 
    hasPermission('movimientos.crear_salida'), 
    MovimientoController.crearSalida
);

// POST /api/movimientos/transferencias - Crear movimiento de transferencia
router.post('/transferencias', 
    authMiddleware, 
    hasPermission('movimientos.crear_transferencia'), 
    MovimientoController.crearTransferencia
);

// POST /api/movimientos/ajustes - Crear movimiento de ajuste
router.post('/ajustes', 
    authMiddleware, 
    hasPermission('movimientos.crear_ajuste'), 
    MovimientoController.crearAjuste
);

// =======================================
// RUTAS DE APROBACIÓN Y GESTIÓN
// =======================================

// PUT /api/movimientos/:movimientoId/aprobar - Aprobar movimiento
router.put('/:movimientoId/aprobar', 
    authMiddleware, 
    hasPermission('movimientos.aprobar'), 
    MovimientoController.aprobarMovimiento
);

// =======================================
// RUTAS UTILITARIAS
// =======================================

// POST /api/movimientos/validar-stock - Validar disponibilidad de stock
router.post('/validar-stock', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.validarStock
);

// =======================================
// RUTAS PARA GENERACIÓN DE DOCUMENTOS
// =======================================

// POST /api/movimientos/generar-ticket-pdf - Generar ticket PDF para impresión
router.post('/generar-ticket-pdf', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    MovimientoController.generarTicketPDF
);

// =======================================
// RUTAS ESPECÍFICAS POR TIPO DE MOVIMIENTO
// =======================================

// GET /api/movimientos/tipo/entradas - Obtener solo movimientos de entrada
router.get('/tipo/entradas', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        req.query.tipo_movimiento = 'Entrada';
        return MovimientoController.getAllMovimientos(req, res);
    }
);

// GET /api/movimientos/tipo/salidas - Obtener solo movimientos de salida
router.get('/tipo/salidas', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        req.query.tipo_movimiento = 'Salida';
        return MovimientoController.getAllMovimientos(req, res);
    }
);

// GET /api/movimientos/tipo/transferencias - Obtener solo movimientos de transferencia
router.get('/tipo/transferencias', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        req.query.tipo_movimiento = 'Transferencia';
        return MovimientoController.getAllMovimientos(req, res);
    }
);

// GET /api/movimientos/tipo/ajustes - Obtener solo movimientos de ajuste
router.get('/tipo/ajustes', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        req.query.tipo_movimiento = 'Ajuste';
        return MovimientoController.getAllMovimientos(req, res);
    }
);

// =======================================
// RUTAS PARA REPORTES ESPECÍFICOS
// =======================================

// GET /api/movimientos/reportes/por-bodega/:bodegaId - Movimientos de una bodega específica
router.get('/reportes/por-bodega/:bodegaId', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        try {
            const { bodegaId } = req.params;
            
            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            req.query.bodega_id = bodegaId;
            return MovimientoController.getAllMovimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo movimientos por bodega:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// GET /api/movimientos/reportes/por-usuario/:usuarioId - Movimientos de un usuario específico
router.get('/reportes/por-usuario/:usuarioId', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        try {
            const { usuarioId } = req.params;
            
            if (!usuarioId || isNaN(usuarioId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            req.query.usuario_id = usuarioId;
            return MovimientoController.getAllMovimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo movimientos por usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// GET /api/movimientos/reportes/hoy - Movimientos del día actual
router.get('/reportes/hoy', 
    authMiddleware, 
    hasPermission('movimientos.ver'), 
    async (req, res) => {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            req.query.fecha_inicio = hoy;
            req.query.fecha_fin = hoy;
            return MovimientoController.getAllMovimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo movimientos del día:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// =======================================
// MIDDLEWARE DE VALIDACIÓN ADICIONAL
// =======================================

// Middleware para validar que las rutas de creación tengan datos válidos
const validarDatosMovimiento = (req, res, next) => {
    const { movimiento, items } = req.body;

    if (!movimiento) {
        return res.status(400).json({
            success: false,
            message: 'Los datos del movimiento son requeridos'
        });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Debe especificar al menos un item'
        });
    }

    // Validar que cada item tenga los campos requeridos
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (!item.Item_Id || isNaN(item.Item_Id)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: ID de item inválido`
            });
        }

        if (!item.Cantidad || isNaN(item.Cantidad) || item.Cantidad <= 0) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Cantidad debe ser un número positivo`
            });
        }
    }

    next();
};

// Aplicar middleware de validación a rutas de creación
router.use('/entradas', validarDatosMovimiento);
router.use('/salidas', validarDatosMovimiento);
router.use('/transferencias', validarDatosMovimiento);
router.use('/ajustes', validarDatosMovimiento);

module.exports = router;