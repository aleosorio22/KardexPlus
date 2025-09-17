const db = require('../../core/config/database');

class ItemBodegaParamModel {
    
    // =======================================
    // CONSULTAS PRINCIPALES
    // =======================================

    /**
     * Obtener todos los parámetros con paginación y filtros
     * @param {number} offset - Desplazamiento para paginación
     * @param {number} limit - Límite de registros por página
     * @param {Object} filters - Filtros de búsqueda
     */
    static async findWithPagination(offset = 0, limit = 10, filters = {}) {
        try {
            offset = parseInt(offset) || 0;
            limit = parseInt(limit) || 10;
            
            let whereClause = 'WHERE 1=1';
            let params = [];

            // Filtro por bodega
            if (filters.bodega_id) {
                whereClause += ' AND ibp.Bodega_Id = ?';
                params.push(filters.bodega_id);
            }

            // Filtro por item
            if (filters.item_id) {
                whereClause += ' AND ibp.Item_Id = ?';
                params.push(filters.item_id);
            }

            // Filtro por categoría de item
            if (filters.categoria_id) {
                whereClause += ' AND i.CategoriaItem_Id = ?';
                params.push(filters.categoria_id);
            }

            // Filtro por items activos en bodega
            if (filters.activos_bodega === 'true') {
                whereClause += ' AND ibp.Es_Item_Activo_Bodega = true';
            }

            // Filtro por búsqueda de texto
            if (filters.search) {
                whereClause += ' AND (i.Item_Nombre LIKE ? OR i.Item_Codigo_SKU LIKE ? OR b.Bodega_Nombre LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const query = `
                SELECT 
                    ibp.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    i.Item_Estado,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    b.Bodega_Estado,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    u.Usuario_Nombre as Configurado_Por,
                    
                    -- Información de existencia actual
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual,
                    
                    -- Estados calculados
                    CASE 
                        WHEN COALESCE(e.Cantidad, 0) = 0 THEN 'Sin Stock'
                        WHEN ibp.Stock_Min_Bodega IS NOT NULL AND COALESCE(e.Cantidad, 0) < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND COALESCE(e.Cantidad, 0) > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND COALESCE(e.Cantidad, 0) <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        ELSE 'Normal'
                    END as Estado_Stock_Actual
                    
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Usuarios u ON ibp.Usuario_Configuracion = u.Usuario_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                ${whereClause}
                ORDER BY b.Bodega_Nombre, i.Item_Nombre
                LIMIT ${offset}, ${limit}
            `;

            const [rows] = await db.execute(query, params);

            // Contar total de registros
            const countQuery = `
                SELECT COUNT(*) as total
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                ${whereClause}
            `;

            const [countRows] = await db.execute(countQuery, params);
            const total = countRows[0].total;

            return {
                data: rows,
                pagination: {
                    offset,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener parámetros específicos por item y bodega
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    static async findByItemAndBodega(itemId, bodegaId) {
        try {
            const query = `
                SELECT 
                    ibp.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Costo_Unitario,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo,
                    u.Usuario_Nombre as Configurado_Por,
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Usuarios u ON ibp.Usuario_Configuracion = u.Usuario_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                WHERE ibp.Item_Id = ? AND ibp.Bodega_Id = ?
            `;

            const [rows] = await db.execute(query, [itemId, bodegaId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todos los parámetros por bodega específica
     * @param {number} bodegaId - ID de la bodega
     */
    static async findByBodega(bodegaId) {
        try {
            const query = `
                SELECT 
                    ibp.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Costo_Unitario,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo,
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual,
                    CASE 
                        WHEN COALESCE(e.Cantidad, 0) = 0 THEN 'Sin Stock'
                        WHEN COALESCE(e.Cantidad, 0) < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND COALESCE(e.Cantidad, 0) > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND COALESCE(e.Cantidad, 0) <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                WHERE ibp.Bodega_Id = ? AND ibp.Es_Item_Activo_Bodega = true
                ORDER BY i.Item_Nombre
            `;

            const [rows] = await db.execute(query, [bodegaId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener todos los parámetros por item específico
     * @param {number} itemId - ID del item
     */
    static async findByItem(itemId) {
        try {
            const query = `
                SELECT 
                    ibp.*,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual,
                    CASE 
                        WHEN COALESCE(e.Cantidad, 0) = 0 THEN 'Sin Stock'
                        WHEN COALESCE(e.Cantidad, 0) < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND COALESCE(e.Cantidad, 0) > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND COALESCE(e.Cantidad, 0) <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                WHERE ibp.Item_Id = ? AND ibp.Es_Item_Activo_Bodega = true AND b.Bodega_Estado = true
                ORDER BY b.Bodega_Nombre
            `;

            const [rows] = await db.execute(query, [itemId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // =======================================
    // OPERACIONES CRUD
    // =======================================

    /**
     * Crear nuevos parámetros de item-bodega
     * @param {Object} data - Datos del parámetro
     */
    static async create(data) {
        try {
            const query = `
                INSERT INTO Items_Bodegas_Parametros (
                    Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega,
                    Punto_Reorden, Es_Item_Activo_Bodega, Usuario_Configuracion
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await db.execute(query, [
                data.Item_Id,
                data.Bodega_Id,
                data.Stock_Min_Bodega || 0,
                data.Stock_Max_Bodega || null,
                data.Punto_Reorden || null,
                data.Es_Item_Activo_Bodega !== undefined ? data.Es_Item_Activo_Bodega : true,
                data.Usuario_Configuracion || null
            ]);

            return result;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Ya existen parámetros para este item en esta bodega');
            }
            throw error;
        }
    }

    /**
     * Actualizar parámetros existentes
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     * @param {Object} data - Datos a actualizar
     */
    static async update(itemId, bodegaId, data) {
        try {
            // Verificar que existe el registro
            const existingParam = await this.findByItemAndBodega(itemId, bodegaId);
            if (!existingParam) {
                throw new Error('Parámetros no encontrados');
            }

            const query = `
                UPDATE Items_Bodegas_Parametros 
                SET 
                    Stock_Min_Bodega = ?,
                    Stock_Max_Bodega = ?,
                    Punto_Reorden = ?,
                    Es_Item_Activo_Bodega = ?,
                    Usuario_Configuracion = ?
                WHERE Item_Id = ? AND Bodega_Id = ?
            `;

            const [result] = await db.execute(query, [
                data.Stock_Min_Bodega !== undefined ? data.Stock_Min_Bodega : existingParam.Stock_Min_Bodega,
                data.Stock_Max_Bodega !== undefined ? data.Stock_Max_Bodega : existingParam.Stock_Max_Bodega,
                data.Punto_Reorden !== undefined ? data.Punto_Reorden : existingParam.Punto_Reorden,
                data.Es_Item_Activo_Bodega !== undefined ? data.Es_Item_Activo_Bodega : existingParam.Es_Item_Activo_Bodega,
                data.Usuario_Configuracion || existingParam.Usuario_Configuracion,
                itemId,
                bodegaId
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Crear o actualizar parámetros (upsert)
     * @param {Object} data - Datos del parámetro
     */
    static async createOrUpdate(data) {
        try {
            const query = `
                INSERT INTO Items_Bodegas_Parametros (
                    Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega,
                    Punto_Reorden, Es_Item_Activo_Bodega, Usuario_Configuracion
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    Stock_Min_Bodega = VALUES(Stock_Min_Bodega),
                    Stock_Max_Bodega = VALUES(Stock_Max_Bodega),
                    Punto_Reorden = VALUES(Punto_Reorden),
                    Es_Item_Activo_Bodega = VALUES(Es_Item_Activo_Bodega),
                    Usuario_Configuracion = VALUES(Usuario_Configuracion),
                    Fecha_Configuracion = CURRENT_TIMESTAMP
            `;

            const [result] = await db.execute(query, [
                data.Item_Id,
                data.Bodega_Id,
                data.Stock_Min_Bodega || 0,
                data.Stock_Max_Bodega || null,
                data.Punto_Reorden || null,
                data.Es_Item_Activo_Bodega !== undefined ? data.Es_Item_Activo_Bodega : true,
                data.Usuario_Configuracion || null
            ]);

            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Eliminar parámetros específicos
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    static async delete(itemId, bodegaId) {
        try {
            const query = 'DELETE FROM Items_Bodegas_Parametros WHERE Item_Id = ? AND Bodega_Id = ?';
            const [result] = await db.execute(query, [itemId, bodegaId]);

            if (result.affectedRows === 0) {
                throw new Error('Parámetros no encontrados');
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // =======================================
    // CONSULTAS ESPECIALES
    // =======================================

    /**
     * Obtener items con stock bajo según sus parámetros por bodega
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    static async getItemsStockBajo(bodegaId = null) {
        try {
            let whereClause = `WHERE ibp.Es_Item_Activo_Bodega = true 
                              AND i.Item_Estado = true 
                              AND COALESCE(e.Cantidad, 0) < ibp.Stock_Min_Bodega`;
            let params = [];

            if (bodegaId) {
                whereClause += ' AND ibp.Bodega_Id = ?';
                params.push(bodegaId);
            }

            const query = `
                SELECT 
                    ibp.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    b.Bodega_Nombre,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo,
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual,
                    (ibp.Stock_Min_Bodega - COALESCE(e.Cantidad, 0)) as Cantidad_Faltante,
                    ibp.Punto_Reorden
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                ${whereClause}
                ORDER BY (ibp.Stock_Min_Bodega - COALESCE(e.Cantidad, 0)) DESC, i.Item_Nombre
            `;

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener items en punto de reorden
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    static async getItemsPuntoReorden(bodegaId = null) {
        try {
            let whereClause = `WHERE ibp.Es_Item_Activo_Bodega = true 
                              AND i.Item_Estado = true 
                              AND ibp.Punto_Reorden IS NOT NULL
                              AND COALESCE(e.Cantidad, 0) <= ibp.Punto_Reorden`;
            let params = [];

            if (bodegaId) {
                whereClause += ' AND ibp.Bodega_Id = ?';
                params.push(bodegaId);
            }

            const query = `
                SELECT 
                    ibp.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    b.Bodega_Nombre,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo,
                    COALESCE(e.Cantidad, 0) as Cantidad_Actual
                FROM Items_Bodegas_Parametros ibp
                INNER JOIN Items i ON ibp.Item_Id = i.Item_Id
                INNER JOIN Bodegas b ON ibp.Bodega_Id = b.Bodega_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Existencias e ON ibp.Item_Id = e.Item_Id AND ibp.Bodega_Id = e.Bodega_Id
                ${whereClause}
                ORDER BY b.Bodega_Nombre, i.Item_Nombre
            `;

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Configurar parámetros masivos para una bodega
     * @param {number} bodegaId - ID de la bodega
     * @param {Array} items - Array de items con sus parámetros
     * @param {number} usuarioId - ID del usuario que configura
     */
    static async configurarParametrosMasivos(bodegaId, items, usuarioId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            const query = `
                INSERT INTO Items_Bodegas_Parametros (
                    Item_Id, Bodega_Id, Stock_Min_Bodega, Stock_Max_Bodega,
                    Punto_Reorden, Es_Item_Activo_Bodega, Usuario_Configuracion
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    Stock_Min_Bodega = VALUES(Stock_Min_Bodega),
                    Stock_Max_Bodega = VALUES(Stock_Max_Bodega),
                    Punto_Reorden = VALUES(Punto_Reorden),
                    Es_Item_Activo_Bodega = VALUES(Es_Item_Activo_Bodega),
                    Usuario_Configuracion = VALUES(Usuario_Configuracion),
                    Fecha_Configuracion = CURRENT_TIMESTAMP
            `;

            for (const item of items) {
                await connection.execute(query, [
                    item.Item_Id,
                    bodegaId,
                    item.Stock_Min_Bodega || 0,
                    item.Stock_Max_Bodega || null,
                    item.Punto_Reorden || null,
                    item.Es_Item_Activo_Bodega !== undefined ? item.Es_Item_Activo_Bodega : true,
                    usuarioId
                ]);
            }

            await connection.commit();
            return { success: true, processed: items.length };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = ItemBodegaParamModel;