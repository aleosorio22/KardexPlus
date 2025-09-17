const ItemBodegaParamModel = require('./itemBodegaParam.model');

class ItemBodegaParamController {

    // =======================================
    // CONSULTAS GENERALES
    // =======================================

    /**
     * Obtener todos los parámetros con paginación y filtros
     */
    static async getAllParametros(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // Validaciones
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
                item_id: req.query.item_id,
                categoria_id: req.query.categoria_id,
                activos_bodega: req.query.activos_bodega,
                search: req.query.search
            };

            const result = await ItemBodegaParamModel.findWithPagination(offset, limit, filters);

            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination,
                message: 'Parámetros obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo parámetros:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener parámetros específicos por item y bodega
     */
    static async getParametroByItemAndBodega(req, res) {
        try {
            const { itemId, bodegaId } = req.params;

            if (!itemId || isNaN(itemId) || !bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs de item y bodega inválidos'
                });
            }

            const parametro = await ItemBodegaParamModel.findByItemAndBodega(
                parseInt(itemId), 
                parseInt(bodegaId)
            );

            if (!parametro) {
                return res.status(404).json({
                    success: false,
                    message: 'Parámetros no encontrados para este item en esta bodega'
                });
            }

            res.json({
                success: true,
                data: parametro,
                message: 'Parámetros obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo parámetros específicos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener parámetros por bodega específica
     */
    static async getParametrosByBodega(req, res) {
        try {
            const { bodegaId } = req.params;

            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            const parametros = await ItemBodegaParamModel.findByBodega(parseInt(bodegaId));

            res.json({
                success: true,
                data: parametros,
                message: 'Parámetros de la bodega obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo parámetros por bodega:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener parámetros por item específico
     */
    static async getParametrosByItem(req, res) {
        try {
            const { itemId } = req.params;

            if (!itemId || isNaN(itemId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de item inválido'
                });
            }

            const parametros = await ItemBodegaParamModel.findByItem(parseInt(itemId));

            res.json({
                success: true,
                data: parametros,
                message: 'Parámetros del item obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo parámetros por item:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // OPERACIONES CRUD
    // =======================================

    /**
     * Crear nuevos parámetros
     */
    static async createParametro(req, res) {
        try {
            const { Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega } = req.body;

            // Validaciones obligatorias
            if (!Item_Id || !Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'Item_Id y Bodega_Id son obligatorios'
                });
            }

            // Validaciones de rango
            if (Stock_Min_Bodega !== undefined && (isNaN(Stock_Min_Bodega) || Stock_Min_Bodega < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Min_Bodega debe ser un número no negativo'
                });
            }

            if (Stock_Max_Bodega !== undefined && Stock_Max_Bodega !== null && 
                (isNaN(Stock_Max_Bodega) || Stock_Max_Bodega < (Stock_Min_Bodega || 0))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Max_Bodega debe ser mayor o igual al stock mínimo'
                });
            }

            if (Punto_Reorden !== undefined && Punto_Reorden !== null && 
                (isNaN(Punto_Reorden) || Punto_Reorden < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Punto_Reorden debe ser un número no negativo'
                });
            }

            // Obtener usuario actual del token (se implementará con middleware de auth)
            const usuarioId = req.user ? req.user.Usuario_Id : null;

            const parametroData = {
                Item_Id: parseInt(Item_Id),
                Bodega_Id: parseInt(Bodega_Id),
                Stock_Min_Bodega: Stock_Min_Bodega !== undefined ? parseInt(Stock_Min_Bodega) : 0,
                Stock_Max_Bodega: Stock_Max_Bodega !== undefined && Stock_Max_Bodega !== null ? parseInt(Stock_Max_Bodega) : null,
                Punto_Reorden: Punto_Reorden !== undefined && Punto_Reorden !== null ? parseInt(Punto_Reorden) : null,
                Es_Item_Activo_Bodega: Es_Item_Activo_Bodega !== undefined ? Es_Item_Activo_Bodega : true,
                Usuario_Configuracion: usuarioId
            };

            const result = await ItemBodegaParamModel.create(parametroData);

            res.status(201).json({
                success: true,
                data: { 
                    ItemBodegaParam_Id: result.insertId,
                    ...parametroData
                },
                message: 'Parámetros creados exitosamente'
            });
        } catch (error) {
            console.error('Error creando parámetros:', error);
            
            if (error.message.includes('Ya existen parámetros')) {
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
     * Actualizar parámetros existentes
     */
    static async updateParametro(req, res) {
        try {
            const { itemId, bodegaId } = req.params;
            const { Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega } = req.body;

            if (!itemId || isNaN(itemId) || !bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs de item y bodega inválidos'
                });
            }

            // Validaciones de rango
            if (Stock_Min_Bodega !== undefined && (isNaN(Stock_Min_Bodega) || Stock_Min_Bodega < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Min_Bodega debe ser un número no negativo'
                });
            }

            if (Stock_Max_Bodega !== undefined && Stock_Max_Bodega !== null && 
                (isNaN(Stock_Max_Bodega) || Stock_Max_Bodega < (Stock_Min_Bodega || 0))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Max_Bodega debe ser mayor o igual al stock mínimo'
                });
            }

            if (Punto_Reorden !== undefined && Punto_Reorden !== null && 
                (isNaN(Punto_Reorden) || Punto_Reorden < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Punto_Reorden debe ser un número no negativo'
                });
            }

            const usuarioId = req.user ? req.user.Usuario_Id : null;

            const updateData = {
                Stock_Min_Bodega: Stock_Min_Bodega !== undefined ? parseInt(Stock_Min_Bodega) : undefined,
                Stock_Max_Bodega: Stock_Max_Bodega !== undefined ? 
                    (Stock_Max_Bodega !== null ? parseInt(Stock_Max_Bodega) : null) : undefined,
                Punto_Reorden: Punto_Reorden !== undefined ? 
                    (Punto_Reorden !== null ? parseInt(Punto_Reorden) : null) : undefined,
                Es_Item_Activo_Bodega: Es_Item_Activo_Bodega !== undefined ? Es_Item_Activo_Bodega : undefined,
                Usuario_Configuracion: usuarioId
            };

            const result = await ItemBodegaParamModel.update(
                parseInt(itemId),
                parseInt(bodegaId),
                updateData
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Parámetros no encontrados'
                });
            }

            res.json({
                success: true,
                message: 'Parámetros actualizados exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando parámetros:', error);
            
            if (error.message === 'Parámetros no encontrados') {
                return res.status(404).json({
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
     * Crear o actualizar parámetros (upsert)
     */
    static async createOrUpdateParametro(req, res) {
        try {
            const { Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega } = req.body;

            // Validaciones obligatorias
            if (!Item_Id || !Bodega_Id) {
                return res.status(400).json({
                    success: false,
                    message: 'Item_Id y Bodega_Id son obligatorios'
                });
            }

            // Validaciones de rango (igual que en create)
            if (Stock_Min_Bodega !== undefined && (isNaN(Stock_Min_Bodega) || Stock_Min_Bodega < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Min_Bodega debe ser un número no negativo'
                });
            }

            if (Stock_Max_Bodega !== undefined && Stock_Max_Bodega !== null && 
                (isNaN(Stock_Max_Bodega) || Stock_Max_Bodega < (Stock_Min_Bodega || 0))) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock_Max_Bodega debe ser mayor o igual al stock mínimo'
                });
            }

            if (Punto_Reorden !== undefined && Punto_Reorden !== null && 
                (isNaN(Punto_Reorden) || Punto_Reorden < 0)) {
                return res.status(400).json({
                    success: false,
                    message: 'Punto_Reorden debe ser un número no negativo'
                });
            }

            const usuarioId = req.user ? req.user.Usuario_Id : null;

            const parametroData = {
                Item_Id: parseInt(Item_Id),
                Bodega_Id: parseInt(Bodega_Id),
                Stock_Min_Bodega: Stock_Min_Bodega !== undefined ? parseInt(Stock_Min_Bodega) : 0,
                Stock_Max_Bodega: Stock_Max_Bodega !== undefined && Stock_Max_Bodega !== null ? parseInt(Stock_Max_Bodega) : null,
                Punto_Reorden: Punto_Reorden !== undefined && Punto_Reorden !== null ? parseInt(Punto_Reorden) : null,
                Es_Item_Activo_Bodega: Es_Item_Activo_Bodega !== undefined ? Es_Item_Activo_Bodega : true,
                Usuario_Configuracion: usuarioId
            };

            const result = await ItemBodegaParamModel.createOrUpdate(parametroData);

            res.json({
                success: true,
                data: parametroData,
                message: result.insertId ? 'Parámetros creados exitosamente' : 'Parámetros actualizados exitosamente'
            });
        } catch (error) {
            console.error('Error creando/actualizando parámetros:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar parámetros específicos
     */
    static async deleteParametro(req, res) {
        try {
            const { itemId, bodegaId } = req.params;

            if (!itemId || isNaN(itemId) || !bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs de item y bodega inválidos'
                });
            }

            const result = await ItemBodegaParamModel.delete(parseInt(itemId), parseInt(bodegaId));

            res.json({
                success: true,
                message: 'Parámetros eliminados exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando parámetros:', error);
            
            if (error.message === 'Parámetros no encontrados') {
                return res.status(404).json({
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
    // CONSULTAS ESPECIALES
    // =======================================

    /**
     * Obtener items con stock bajo según parámetros
     */
    static async getItemsStockBajo(req, res) {
        try {
            const { bodegaId } = req.query;
            
            const items = await ItemBodegaParamModel.getItemsStockBajo(
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

    /**
     * Obtener items en punto de reorden
     */
    static async getItemsPuntoReorden(req, res) {
        try {
            const { bodegaId } = req.query;
            
            const items = await ItemBodegaParamModel.getItemsPuntoReorden(
                bodegaId ? parseInt(bodegaId) : null
            );

            res.json({
                success: true,
                data: items,
                message: 'Items en punto de reorden obtenidos exitosamente'
            });
        } catch (error) {
            console.error('Error obteniendo items en punto de reorden:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Configurar parámetros masivos para una bodega
     */
    static async configurarParametrosMasivos(req, res) {
        try {
            const { bodegaId } = req.params;
            const { items } = req.body;

            if (!bodegaId || isNaN(bodegaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de bodega inválido'
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de items con sus parámetros'
                });
            }

            // Validar estructura de cada item
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.Item_Id) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i}: Item_Id es obligatorio`
                    });
                }

                if (item.Stock_Min_Bodega !== undefined && (isNaN(item.Stock_Min_Bodega) || item.Stock_Min_Bodega < 0)) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i}: Stock_Min_Bodega inválido`
                    });
                }

                if (item.Stock_Max_Bodega !== undefined && item.Stock_Max_Bodega !== null && 
                    (isNaN(item.Stock_Max_Bodega) || item.Stock_Max_Bodega < (item.Stock_Min_Bodega || 0))) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i}: Stock_Max_Bodega inválido`
                    });
                }
            }

            const usuarioId = req.user ? req.user.Usuario_Id : null;

            const result = await ItemBodegaParamModel.configurarParametrosMasivos(
                parseInt(bodegaId),
                items,
                usuarioId
            );

            res.json({
                success: true,
                data: result,
                message: `Configuración masiva completada: ${result.processed} items procesados`
            });
        } catch (error) {
            console.error('Error en configuración masiva:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ItemBodegaParamController;