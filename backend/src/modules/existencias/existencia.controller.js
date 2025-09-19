const ExistenciaModel = require('./existencia.model');

class ExistenciaController {
    // Obtener todas las existencias sin paginación (para DataTable frontend)
    static async getAllExistencias(req, res) {
        try {
            const filters = {
                bodega_id: req.query.bodega_id,
                categoria_id: req.query.categoria_id,
                stock_bajo: req.query.stock_bajo,
                stock_cero: req.query.stock_cero,
                search: req.query.search
            };

            const existencias = await ExistenciaModel.findAll(filters);

            res.json({
                success: true,
                data: existencias,
                total: existencias.length,
                message: 'Existencias obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo existencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener existencias con paginación (endpoint opcional)
    static async getExistenciasWithPagination(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Validaciones para asegurar que son números válidos
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
                bodega_id: req.query.bodega_id,
                categoria_id: req.query.categoria_id,
                stock_bajo: req.query.stock_bajo,
                stock_cero: req.query.stock_cero,
                search: req.query.search
            };

            console.log('Debug - offset:', offset, 'limit:', limit, 'filters:', filters);
            const result = await ExistenciaModel.findWithPagination(offset, limit, filters);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Existencias obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo existencias con paginación:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener existencias por bodega específica
    static async getExistenciasByBodega(req, res) {
        try {
            const { bodegaId } = req.params;

            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            const existencias = await ExistenciaModel.findByBodega(parseInt(bodegaId));

            res.json({
                success: true,
                data: existencias,
                message: 'Existencias de la bodega obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo existencias por bodega:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener existencia específica por bodega e item
    static async getExistenciaByBodegaAndItem(req, res) {
        try {
            const { bodegaId, itemId } = req.params;

            if (!bodegaId || isNaN(bodegaId) || !itemId || isNaN(itemId)) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs de bodega e item inválidos'
                });
            }

            const existencia = await ExistenciaModel.findByBodegaAndItem(
                parseInt(bodegaId), 
                parseInt(itemId)
            );

            if (!existencia) {
                return res.status(404).json({
                    success: false,
                    message: 'Existencia no encontrada'
                });
            }

            res.json({
                success: true,
                data: existencia,
                message: 'Existencia obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo existencia específica:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener resumen de existencias por bodega
    static async getResumenExistencias(req, res) {
        try {
            const resumen = await ExistenciaModel.getResumenPorBodega();

            res.json({
                success: true,
                data: resumen,
                message: 'Resumen de existencias obtenido exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo resumen de existencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener items con stock bajo
    static async getItemsStockBajo(req, res) {
        try {
            const { bodegaId } = req.query;
            
            const items = await ExistenciaModel.getItemsStockBajo(
                bodegaId ? parseInt(bodegaId) : null
            );

            res.json({
                success: true,
                data: items,
                message: 'Items con stock bajo obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo items con stock bajo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // Obtener items sin stock
    static async getItemsSinStock(req, res) {
        try {
            const { bodegaId } = req.query;
            
            const items = await ExistenciaModel.getItemsSinStock(
                bodegaId ? parseInt(bodegaId) : null
            );

            res.json({
                success: true,
                data: items,
                message: 'Items sin stock obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo items sin stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ExistenciaController;
