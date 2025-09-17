const express = require('express');
const router = express.Router();
const ExistenciaController = require('./existencia.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

// =======================================
// RUTAS DE CONSULTA DE EXISTENCIAS
// =======================================

// GET /api/existencias - Obtener todas las existencias con paginación y filtros
router.get('/', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getAllExistencias
);

// GET /api/existencias/resumen - Obtener resumen de existencias por bodega
router.get('/resumen', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getResumenExistencias
);

// GET /api/existencias/stock-bajo - Obtener items con stock bajo
router.get('/stock-bajo', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getItemsStockBajo
);

// GET /api/existencias/sin-stock - Obtener items sin stock
router.get('/sin-stock', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getItemsSinStock
);

// GET /api/existencias/bodega/:bodegaId - Obtener existencias por bodega específica
router.get('/bodega/:bodegaId', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getExistenciasByBodega
);

// GET /api/existencias/bodega/:bodegaId/item/:itemId - Obtener existencia específica
router.get('/bodega/:bodegaId/item/:itemId', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    ExistenciaController.getExistenciaByBodegaAndItem
);

// =======================================
// RUTAS ADICIONALES PARA REPORTES
// =======================================

// GET /api/existencias/bodega/:bodegaId/valor-total - Valor total del inventario por bodega
router.get('/bodega/:bodegaId/valor-total', 
    authMiddleware, 
    hasPermission('inventario.ver'), 
    async (req, res) => {
        try {
            const { bodegaId } = req.params;
            
            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            const existencias = await ExistenciaController.getExistenciasByBodega(req, res);
            // Esta ruta se puede expandir para cálculos específicos
            
        } catch (error) {
            console.error('Error obteniendo valor total:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
);

module.exports = router;
