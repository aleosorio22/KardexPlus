const express = require('express');
const router = express.Router();
const RequerimientoController = require('./requerimiento.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

// =======================================
// RUTAS DE CONSULTA DE REQUERIMIENTOS
// =======================================

// GET /api/requerimientos - Obtener todos los requerimientos con filtros
router.get('/', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getAllRequerimientos
);

// GET /api/requerimientos/ver-todos - Obtener todos los requerimientos del sistema
router.get('/ver-todos', 
    authMiddleware, 
    hasPermission('requerimientos.ver_todos'), 
    RequerimientoController.getAllRequerimientos
);

// GET /api/requerimientos/mis-requerimientos - Obtener requerimientos del usuario autenticado
router.get('/mis-requerimientos', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getMisRequerimientos
);

// GET /api/requerimientos/:requerimientoId - Obtener requerimiento por ID con detalle completo
router.get('/:requerimientoId', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getRequerimientoById
);

// GET /api/requerimientos/estado/:estado - Obtener requerimientos por estado específico
router.get('/estado/:estado', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getRequerimientosByEstado
);

// GET /api/requerimientos/bodega/:bodegaId - Obtener requerimientos de una bodega específica
router.get('/bodega/:bodegaId', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getRequerimientosByBodega
);

// =======================================
// RUTAS DE CREACIÓN DE REQUERIMIENTOS
// =======================================

// POST /api/requerimientos - Crear nuevo requerimiento
router.post('/', 
    authMiddleware, 
    hasPermission('requerimientos.crear'), 
    RequerimientoController.crearRequerimiento
);

// POST /api/requerimientos/validar-creacion - Validar datos antes de crear requerimiento
router.post('/validar-creacion', 
    authMiddleware, 
    hasPermission('requerimientos.crear'), 
    RequerimientoController.validarCreacion
);

// =======================================
// RUTAS DE APROBACIÓN Y GESTIÓN
// =======================================

// PUT /api/requerimientos/:requerimientoId/aprobar - Aprobar requerimiento
router.put('/:requerimientoId/aprobar', 
    authMiddleware, 
    hasPermission('requerimientos.aprobar'), 
    RequerimientoController.aprobarRequerimiento
);

// PUT /api/requerimientos/:requerimientoId/rechazar - Rechazar requerimiento
router.put('/:requerimientoId/rechazar', 
    authMiddleware, 
    hasPermission('requerimientos.aprobar'), // Mismo permiso que aprobar
    RequerimientoController.rechazarRequerimiento
);

// PUT /api/requerimientos/:requerimientoId/despachar - Despachar requerimiento
router.put('/:requerimientoId/despachar', 
    authMiddleware, 
    hasPermission('requerimientos.despachar'), 
    RequerimientoController.despacharRequerimiento
);

// PUT /api/requerimientos/:requerimientoId/cancelar - Cancelar requerimiento propio
router.put('/:requerimientoId/cancelar', 
    authMiddleware, 
    hasPermission('requerimientos.cancelar'), 
    RequerimientoController.cancelarRequerimiento
);

// PUT /api/requerimientos/:requerimientoId/cancelar-otros - Cancelar requerimiento de otros usuarios
router.put('/:requerimientoId/cancelar-otros', 
    authMiddleware, 
    hasPermission('requerimientos.cancelar_otros'), 
    RequerimientoController.cancelarRequerimiento
);

// PUT /api/requerimientos/:requerimientoId/editar - Editar requerimiento pendiente
router.put('/:requerimientoId/editar', 
    authMiddleware, 
    hasPermission('requerimientos.editar'), 
    async (req, res) => {
        try {
            // TODO: Implementar lógica de edición de requerimientos pendientes
            res.status(501).json({
                success: false,
                message: 'Funcionalidad de edición en desarrollo'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// DELETE /api/requerimientos/:requerimientoId - Eliminar requerimiento
router.delete('/:requerimientoId', 
    authMiddleware, 
    hasPermission('requerimientos.eliminar'), 
    async (req, res) => {
        try {
            // TODO: Implementar lógica de eliminación de requerimientos
            res.status(501).json({
                success: false,
                message: 'Funcionalidad de eliminación en desarrollo'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// =======================================
// RUTAS DE RECEPCIÓN
// =======================================

// PUT /api/requerimientos/:requerimientoId/recibir - Confirmar recepción de requerimiento despachado
router.put('/:requerimientoId/recibir', 
    authMiddleware, 
    hasPermission('requerimientos.recibir'), 
    async (req, res) => {
        try {
            // TODO: Implementar lógica de recepción de requerimientos
            res.status(501).json({
                success: false,
                message: 'Funcionalidad de recepción en desarrollo'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// =======================================
// RUTAS DE REPORTES Y ESTADÍSTICAS
// =======================================

// GET /api/requerimientos/reportes/estadisticas - Obtener estadísticas de requerimientos
router.get('/reportes/estadisticas', 
    authMiddleware, 
    hasPermission('requerimientos.reportes'), 
    RequerimientoController.getEstadisticas
);

// GET /api/requerimientos/reportes/generar - Generar reporte completo
router.get('/reportes/generar', 
    authMiddleware, 
    hasPermission('requerimientos.reportes'), 
    RequerimientoController.generarReporte
);

// =======================================
// RUTAS ESPECÍFICAS POR ESTADO
// =======================================

// GET /api/requerimientos/estados/pendientes - Obtener requerimientos pendientes
router.get('/estados/pendientes', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    RequerimientoController.getRequerimientosPendientes
);

// GET /api/requerimientos/estados/para-despacho - Obtener requerimientos aprobados para despacho
router.get('/estados/para-despacho', 
    authMiddleware, 
    hasPermission('requerimientos.despachar'), 
    RequerimientoController.getRequerimientosParaDespacho
);

// GET /api/requerimientos/estados/aprobados - Obtener solo requerimientos aprobados
router.get('/estados/aprobados', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    async (req, res) => {
        req.params.estado = 'Aprobado';
        return RequerimientoController.getRequerimientosByEstado(req, res);
    }
);

// GET /api/requerimientos/estados/completados - Obtener solo requerimientos completados
router.get('/estados/completados', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    async (req, res) => {
        req.params.estado = 'Completado';
        return RequerimientoController.getRequerimientosByEstado(req, res);
    }
);

// GET /api/requerimientos/estados/en-despacho - Obtener requerimientos en proceso de despacho
router.get('/estados/en-despacho', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    async (req, res) => {
        req.params.estado = 'En_Despacho';
        return RequerimientoController.getRequerimientosByEstado(req, res);
    }
);

// GET /api/requerimientos/estados/parcialmente-despachados - Obtener requerimientos parcialmente despachados
router.get('/estados/parcialmente-despachados', 
    authMiddleware, 
    hasPermission('requerimientos.ver'), 
    async (req, res) => {
        req.params.estado = 'Parcialmente_Despachado';
        return RequerimientoController.getRequerimientosByEstado(req, res);
    }
);

// =======================================
// RUTAS PARA REPORTES ESPECÍFICOS
// =======================================

// GET /api/requerimientos/reportes/por-bodega/:bodegaId - Requerimientos de una bodega específica
router.get('/reportes/por-bodega/:bodegaId', 
    authMiddleware, 
    hasPermission('requerimientos.reportes'), 
    async (req, res) => {
        try {
            const { bodegaId } = req.params;
            const { tipo } = req.query; // 'origen' o 'destino'
            
            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            req.query.bodega_id = bodegaId;
            return RequerimientoController.getAllRequerimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo requerimientos por bodega:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// GET /api/requerimientos/reportes/por-usuario/:usuarioId - Requerimientos de un usuario específico
router.get('/reportes/por-usuario/:usuarioId', 
    authMiddleware, 
    hasPermission('requerimientos.reportes'), 
    async (req, res) => {
        try {
            const { usuarioId } = req.params;
            
            if (!usuarioId || isNaN(usuarioId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            req.query.usuario_solicita_id = usuarioId;
            return RequerimientoController.getAllRequerimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo requerimientos por usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

// GET /api/requerimientos/reportes/hoy - Requerimientos del día actual
router.get('/reportes/hoy', 
    authMiddleware, 
    hasPermission('requerimientos.reportes'), 
    async (req, res) => {
        try {
            const hoy = new Date().toISOString().split('T')[0];
            req.query.fecha_inicio = hoy;
            req.query.fecha_fin = hoy;
            return RequerimientoController.getAllRequerimientos(req, res);
            
        } catch (error) {
            console.error('Error obteniendo requerimientos del día:', error);
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
const validarDatosRequerimiento = (req, res, next) => {
    const { requerimiento, items } = req.body;

    if (!requerimiento) {
        return res.status(400).json({
            success: false,
            message: 'Los datos del requerimiento son requeridos'
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

        // Validar cantidad solicitada normal o por presentación
        if (!item.Cantidad_Solicitada && !item.Cantidad_Solicitada_Presentacion) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Debe especificar cantidad solicitada`
            });
        }

        if (item.Cantidad_Solicitada && (isNaN(item.Cantidad_Solicitada) || item.Cantidad_Solicitada <= 0)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Cantidad solicitada debe ser un número positivo`
            });
        }

        if (item.Cantidad_Solicitada_Presentacion && (isNaN(item.Cantidad_Solicitada_Presentacion) || item.Cantidad_Solicitada_Presentacion <= 0)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Cantidad solicitada por presentación debe ser un número positivo`
            });
        }
    }

    next();
};

// Middleware para validar datos de despacho
const validarDatosDespacho = (req, res, next) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Debe especificar al menos un item para despachar'
        });
    }

    // Validar que cada item tenga los campos requeridos para despacho
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (!item.Item_Id || isNaN(item.Item_Id)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: ID de item inválido`
            });
        }

        if (!item.Cantidad_Despachada && !item.Cantidad_Despachada_Presentacion) {
            continue; // Permitir items con cantidad 0 (no despachar)
        }

        if (item.Cantidad_Despachada && (isNaN(item.Cantidad_Despachada) || item.Cantidad_Despachada < 0)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Cantidad despachada debe ser un número no negativo`
            });
        }

        if (item.Cantidad_Despachada_Presentacion && (isNaN(item.Cantidad_Despachada_Presentacion) || item.Cantidad_Despachada_Presentacion < 0)) {
            return res.status(400).json({
                success: false,
                message: `Item en posición ${i + 1}: Cantidad despachada por presentación debe ser un número no negativo`
            });
        }
    }

    next();
};

// Aplicar middleware de validación a rutas específicas
router.use('/', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/') {
        return validarDatosRequerimiento(req, res, next);
    }
    next();
});

router.use('/:requerimientoId/despachar', validarDatosDespacho);

module.exports = router;