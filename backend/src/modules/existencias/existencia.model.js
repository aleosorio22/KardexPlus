const db = require('../../core/config/database');

class ExistenciaModel {
    // Obtener todas las existencias sin paginación (para DataTable frontend)
    static async findAll(filters = {}) {
        try {
            let whereClause = 'WHERE 1=1';
            let params = [];

            // Filtro por bodega
            if (filters.bodega_id) {
                whereClause += ' AND e.Bodega_Id = ?';
                params.push(filters.bodega_id);
            }

            // Filtro por categoría
            if (filters.categoria_id) {
                whereClause += ' AND i.CategoriaItem_Id = ?';
                params.push(filters.categoria_id);
            }

            // Filtro por stock bajo (usando parámetros reales o fallback)
            if (filters.stock_bajo === 'true') {
                whereClause += ' AND ((ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega) OR (ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10))';
            }

            // Filtro por stock cero
            if (filters.stock_cero === 'true') {
                whereClause += ' AND e.Cantidad = 0';
            }

            // Filtro por búsqueda de texto
            if (filters.search) {
                whereClause += ' AND (i.Item_Nombre LIKE ? OR i.Item_Codigo_SKU LIKE ? OR i.Item_Codigo_Barra LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    (e.Cantidad * i.Item_Costo_Unitario) as Valor_Total,
                    
                    -- Parámetros de stock por bodega
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    
                    -- Estado de stock usando parámetros reales
                    CASE 
                        WHEN e.Cantidad = 0 THEN 'Sin Stock'
                        WHEN ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND e.Cantidad > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND e.Cantidad <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        -- Fallback para items sin parámetros configurados
                        WHEN ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10 THEN 'Stock Bajo (Config. Pendiente)'
                        WHEN ibp.Stock_Max_Bodega IS NULL AND e.Cantidad > 100 THEN 'Sobre Stock (Config. Pendiente)'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                ${whereClause}
                ORDER BY b.Bodega_Nombre, i.Item_Nombre
            `;

            const [rows] = await db.execute(query, params);
            return rows;

        } catch (error) {
            throw error;
        }
    }

    // Obtener todas las existencias con paginación
    static async findWithPagination(offset = 0, limit = 10, filters = {}) {
        try {
            // Asegurar que offset y limit sean números válidos
            offset = parseInt(offset) || 0;
            limit = parseInt(limit) || 10;
            
            let whereClause = 'WHERE 1=1';
            let params = [];

            // Filtro por bodega
            if (filters.bodega_id) {
                whereClause += ' AND e.Bodega_Id = ?';
                params.push(filters.bodega_id);
            }

            // Filtro por categoría
            if (filters.categoria_id) {
                whereClause += ' AND i.CategoriaItem_Id = ?';
                params.push(filters.categoria_id);
            }

            // Filtro por stock bajo (usando parámetros reales o fallback)
            if (filters.stock_bajo === 'true') {
                whereClause += ' AND ((ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega) OR (ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10))';
            }

            // Filtro por stock cero
            if (filters.stock_cero === 'true') {
                whereClause += ' AND e.Cantidad = 0';
            }

            // Filtro por búsqueda de texto
            if (filters.search) {
                whereClause += ' AND (i.Item_Nombre LIKE ? OR i.Item_Codigo_SKU LIKE ? OR i.Item_Codigo_Barra LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    (e.Cantidad * i.Item_Costo_Unitario) as Valor_Total,
                    
                    -- Parámetros de stock por bodega
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    
                    -- Estado de stock usando parámetros reales
                    CASE 
                        WHEN e.Cantidad = 0 THEN 'Sin Stock'
                        WHEN ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND e.Cantidad > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND e.Cantidad <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        -- Fallback para items sin parámetros configurados
                        WHEN ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10 THEN 'Stock Bajo (Config. Pendiente)'
                        WHEN ibp.Stock_Max_Bodega IS NULL AND e.Cantidad > 100 THEN 'Sobre Stock (Config. Pendiente)'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                ${whereClause}
                ORDER BY b.Bodega_Nombre, i.Item_Nombre
                LIMIT ${offset}, ${limit}
            `;

            const [rows] = await db.execute(query, params);
            
            // Contar total de registros
            const countQuery = `
                SELECT COUNT(*) as total
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
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

    // Obtener existencias por bodega específica
    static async findByBodega(bodegaId) {
        try {
            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    (e.Cantidad * i.Item_Costo_Unitario) as Valor_Total,
                    
                    -- Parámetros de stock por bodega
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    
                    -- Estado de stock usando parámetros reales
                    CASE 
                        WHEN e.Cantidad = 0 THEN 'Sin Stock'
                        WHEN ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND e.Cantidad > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND e.Cantidad <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        -- Fallback para items sin parámetros configurados
                        WHEN ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10 THEN 'Stock Bajo (Config. Pendiente)'
                        WHEN ibp.Stock_Max_Bodega IS NULL AND e.Cantidad > 100 THEN 'Sobre Stock (Config. Pendiente)'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                WHERE e.Bodega_Id = ? AND b.Bodega_Estado = true AND i.Item_Estado = true
                ORDER BY i.Item_Nombre
            `;

            const [rows] = await db.execute(query, [bodegaId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener existencia específica por bodega e item
    static async findByBodegaAndItem(bodegaId, itemId) {
        try {
            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    (e.Cantidad * i.Item_Costo_Unitario) as Valor_Total,
                    
                    -- Parámetros de stock por bodega
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    
                    -- Estado de stock usando parámetros reales
                    CASE 
                        WHEN e.Cantidad = 0 THEN 'Sin Stock'
                        WHEN ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega THEN 'Stock Bajo'
                        WHEN ibp.Stock_Max_Bodega IS NOT NULL AND e.Cantidad > ibp.Stock_Max_Bodega THEN 'Sobre Stock'
                        WHEN ibp.Punto_Reorden IS NOT NULL AND e.Cantidad <= ibp.Punto_Reorden THEN 'Punto Reorden'
                        -- Fallback para items sin parámetros configurados
                        WHEN ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10 THEN 'Stock Bajo (Config. Pendiente)'
                        WHEN ibp.Stock_Max_Bodega IS NULL AND e.Cantidad > 100 THEN 'Sobre Stock (Config. Pendiente)'
                        ELSE 'Normal'
                    END as Estado_Stock
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                WHERE e.Bodega_Id = ? AND e.Item_Id = ?
            `;

            const [rows] = await db.execute(query, [bodegaId, itemId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Obtener resumen de existencias por bodega
    static async getResumenPorBodega() {
        try {
            const query = `
                SELECT 
                    b.Bodega_Id,
                    b.Bodega_Nombre,
                    b.Bodega_Tipo,
                    COUNT(e.Existencia_Id) as Total_Items,
                    SUM(e.Cantidad) as Total_Cantidad,
                    SUM(e.Cantidad * i.Item_Costo_Unitario) as Valor_Total_Inventario,
                    COUNT(CASE WHEN e.Cantidad = 0 THEN 1 END) as Items_Sin_Stock,
                    COUNT(CASE WHEN (ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega) OR (ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10) THEN 1 END) as Items_Stock_Bajo
                FROM Bodegas b
                LEFT JOIN Existencias e ON b.Bodega_Id = e.Bodega_Id
                LEFT JOIN Items i ON e.Item_Id = i.Item_Id AND i.Item_Estado = true
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                WHERE b.Bodega_Estado = true
                GROUP BY b.Bodega_Id, b.Bodega_Nombre, b.Bodega_Tipo
                ORDER BY b.Bodega_Nombre
            `;

            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener items con stock bajo
    static async getItemsStockBajo(bodegaId = null) {
        try {
            let whereClause = 'WHERE ((ibp.Stock_Min_Bodega IS NOT NULL AND e.Cantidad < ibp.Stock_Min_Bodega) OR (ibp.Stock_Min_Bodega IS NULL AND e.Cantidad <= 10)) AND i.Item_Estado = true';
            let params = [];

            if (bodegaId) {
                whereClause += ' AND e.Bodega_Id = ?';
                params.push(bodegaId);
            }

            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,
                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo,
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    ibp.Stock_Min_Bodega,
                    ibp.Stock_Max_Bodega,
                    ibp.Punto_Reorden,
                    COALESCE(ibp.Stock_Min_Bodega, 10) - e.Cantidad as Cantidad_Faltante
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                ${whereClause}
                ORDER BY (COALESCE(ibp.Stock_Min_Bodega, 10) - e.Cantidad) DESC, i.Item_Nombre
            `;

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener items sin stock
    static async getItemsSinStock(bodegaId = null) {
        try {
            let whereClause = 'WHERE e.Cantidad = 0 AND i.Item_Estado = true';
            let params = [];

            if (bodegaId) {
                whereClause += ' AND e.Bodega_Id = ?';
                params.push(bodegaId);
            }

            const query = `
                SELECT 
                    e.*,
                    b.Bodega_Nombre,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU,

                    cat.CategoriaItem_Nombre,
                    um.UnidadMedida_Prefijo
                FROM Existencias e
                INNER JOIN Bodegas b ON e.Bodega_Id = b.Bodega_Id
                INNER JOIN Items i ON e.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems cat ON i.CategoriaItem_Id = cat.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Bodegas_Parametros ibp ON e.Item_Id = ibp.Item_Id AND e.Bodega_Id = ibp.Bodega_Id
                ${whereClause}
                ORDER BY i.Item_Nombre
            `;

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ExistenciaModel;
