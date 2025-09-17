const express = require('express');
const router = express.Router();
const ItemBodegaParamController = require('./itemBodegaParam.controller');

// Middleware de autenticación (se asume que existe)
// const authMiddleware = require('../../core/middlewares/auth.middleware');

// =======================================
// RUTAS PARA CONSULTAS GENERALES
// =======================================

/**
 * GET /api/item-bodega-parametros
 * Obtener todos los parámetros con paginación y filtros
 * Query params: page, limit, bodega_id, item_id, categoria_id, activos_bodega, search
 */
router.get('/', ItemBodegaParamController.getAllParametros);

/**
 * GET /api/item-bodega-parametros/item/:itemId/bodega/:bodegaId
 * Obtener parámetros específicos por item y bodega
 */
router.get('/item/:itemId/bodega/:bodegaId', ItemBodegaParamController.getParametroByItemAndBodega);

/**
 * GET /api/item-bodega-parametros/bodega/:bodegaId
 * Obtener todos los parámetros de una bodega específica
 */
router.get('/bodega/:bodegaId', ItemBodegaParamController.getParametrosByBodega);

/**
 * GET /api/item-bodega-parametros/item/:itemId
 * Obtener parámetros de un item en todas las bodegas
 */
router.get('/item/:itemId', ItemBodegaParamController.getParametrosByItem);

// =======================================
// RUTAS PARA OPERACIONES CRUD
// =======================================

/**
 * POST /api/item-bodega-parametros
 * Crear nuevos parámetros
 * Body: { Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega }
 */
router.post('/', ItemBodegaParamController.createParametro);

/**
 * PUT /api/item-bodega-parametros/item/:itemId/bodega/:bodegaId
 * Actualizar parámetros existentes
 * Body: { Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega }
 */
router.put('/item/:itemId/bodega/:bodegaId', ItemBodegaParamController.updateParametro);

/**
 * POST /api/item-bodega-parametros/upsert
 * Crear o actualizar parámetros (upsert)
 * Body: { Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega }
 */
router.post('/upsert', ItemBodegaParamController.createOrUpdateParametro);

/**
 * DELETE /api/item-bodega-parametros/item/:itemId/bodega/:bodegaId
 * Eliminar parámetros específicos
 */
router.delete('/item/:itemId/bodega/:bodegaId', ItemBodegaParamController.deleteParametro);

// =======================================
// RUTAS PARA CONSULTAS ESPECIALES
// =======================================

/**
 * GET /api/item-bodega-parametros/stock-bajo
 * Obtener items con stock bajo según sus parámetros
 * Query params: bodegaId (opcional)
 */
router.get('/stock-bajo', ItemBodegaParamController.getItemsStockBajo);

/**
 * GET /api/item-bodega-parametros/punto-reorden
 * Obtener items en punto de reorden
 * Query params: bodegaId (opcional)
 */
router.get('/punto-reorden', ItemBodegaParamController.getItemsPuntoReorden);

// =======================================
// RUTAS PARA OPERACIONES MASIVAS
// =======================================

/**
 * POST /api/item-bodega-parametros/bodega/:bodegaId/configurar-masivo
 * Configurar parámetros masivos para una bodega
 * Body: { items: [{ Item_Id, Stock_Min_Bodega, Stock_Max_Bodega, Punto_Reorden, Es_Item_Activo_Bodega }] }
 */
router.post('/bodega/:bodegaId/configurar-masivo', ItemBodegaParamController.configurarParametrosMasivos);

// =======================================
// EXPORTACIÓN CON DOCUMENTACIÓN
// =======================================

/**
 * Rutas disponibles para parámetros de Items por Bodega:
 * 
 * CONSULTAS:
 * - GET    /                                          - Listar todos con paginación
 * - GET    /item/:itemId/bodega/:bodegaId            - Parámetros específicos
 * - GET    /bodega/:bodegaId                         - Parámetros por bodega
 * - GET    /item/:itemId                             - Parámetros por item
 * 
 * CRUD:
 * - POST   /                                         - Crear parámetros
 * - PUT    /item/:itemId/bodega/:bodegaId           - Actualizar parámetros
 * - POST   /upsert                                  - Crear o actualizar (upsert)
 * - DELETE /item/:itemId/bodega/:bodegaId          - Eliminar parámetros
 * 
 * ESPECIALES:
 * - GET    /stock-bajo                              - Items con stock bajo
 * - GET    /punto-reorden                          - Items en punto de reorden
 * 
 * MASIVAS:
 * - POST   /bodega/:bodegaId/configurar-masivo     - Configuración masiva
 * 
 * NOTA: Todas las rutas requieren autenticación (middleware comentado)
 * Para activar autenticación, descomenta la línea del authMiddleware y
 * agrega router.use(authMiddleware) antes de las rutas.
 */

module.exports = router;