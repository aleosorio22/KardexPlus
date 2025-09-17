const db = require('../../core/config/database');

class MovimientoModel {
    
    // =======================================
    // MÉTODOS DE CONSULTA
    // =======================================
    
    /**
     * Obtener todos los movimientos con paginación y filtros
     * @param {number} offset - Desplazamiento para paginación
     * @param {number} limit - Límite de resultados
     * @param {object} filters - Filtros de búsqueda
     */
    static async findWithPagination(offset = 0, limit = 10, filters = {}) {
        try {
            offset = parseInt(offset) || 0;
            limit = parseInt(limit) || 10;
            
            let whereClause = 'WHERE 1=1';
            let params = [];

            // Filtro por tipo de movimiento
            if (filters.tipo_movimiento) {
                whereClause += ' AND m.Tipo_Movimiento = ?';
                params.push(filters.tipo_movimiento);
            }

            // Filtro por bodega (origen o destino)
            if (filters.bodega_id) {
                whereClause += ' AND (m.Origen_Bodega_Id = ? OR m.Destino_Bodega_Id = ?)';
                params.push(filters.bodega_id, filters.bodega_id);
            }

            // Filtro por usuario
            if (filters.usuario_id) {
                whereClause += ' AND m.Usuario_Id = ?';
                params.push(filters.usuario_id);
            }

            // Filtro por rango de fechas
            if (filters.fecha_inicio) {
                whereClause += ' AND DATE(m.Fecha) >= ?';
                params.push(filters.fecha_inicio);
            }

            if (filters.fecha_fin) {
                whereClause += ' AND DATE(m.Fecha) <= ?';
                params.push(filters.fecha_fin);
            }

            // Filtro por item específico
            if (filters.item_id) {
                whereClause += ' AND EXISTS (SELECT 1 FROM Movimientos_Detalle md WHERE md.Movimiento_Id = m.Movimiento_Id AND md.Item_Id = ?)';
                params.push(filters.item_id);
            }

            // Búsqueda por texto (motivo u observaciones)
            if (filters.search) {
                whereClause += ' AND (m.Motivo LIKE ? OR m.Observaciones LIKE ? OR u.Usuario_Nombre LIKE ? OR u.Usuario_Apellido LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            const query = `
                SELECT 
                    m.*,
                    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Usuario_Nombre_Completo,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre,
                    COUNT(md.Item_Id) as Total_Items,
                    SUM(md.Cantidad) as Total_Cantidad
                FROM Movimientos m
                INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON m.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON m.Destino_Bodega_Id = bd.Bodega_Id
                LEFT JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
                ${whereClause}
                GROUP BY m.Movimiento_Id
                ORDER BY m.Fecha DESC
                LIMIT ${offset}, ${limit}
            `;

            const [rows] = await db.execute(query, params);
            
            // Contar total de registros
            const countQuery = `
                SELECT COUNT(DISTINCT m.Movimiento_Id) as total
                FROM Movimientos m
                INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON m.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON m.Destino_Bodega_Id = bd.Bodega_Id
                LEFT JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
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
     * Obtener movimiento por ID con detalle completo
     * @param {number} movimientoId - ID del movimiento
     */
    static async findById(movimientoId) {
        try {
            const movimientoQuery = `
                SELECT 
                    m.*,
                    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Usuario_Nombre_Completo,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre
                FROM Movimientos m
                INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON m.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON m.Destino_Bodega_Id = bd.Bodega_Id
                WHERE m.Movimiento_Id = ?
            `;

            const detalleQuery = `
                SELECT 
                    md.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU as Item_Codigo,
                    i.Item_Nombre as Item_Descripcion,
                    i.Item_Codigo_Barra,
                    i.Item_Costo_Unitario,
                    c.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo as Item_Unidad_Medida,
                    (md.Cantidad * i.Item_Costo_Unitario) as Valor_Total
                FROM Movimientos_Detalle md
                INNER JOIN Items i ON md.Item_Id = i.Item_Id
                INNER JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
                INNER JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                WHERE md.Movimiento_Id = ?
                ORDER BY i.Item_Nombre
            `;

            const [movimientoRows] = await db.execute(movimientoQuery, [movimientoId]);
            const [detalleRows] = await db.execute(detalleQuery, [movimientoId]);

            if (movimientoRows.length === 0) {
                return null;
            }

            return {
                ...movimientoRows[0],
                detalles: detalleRows
            };
        } catch (error) {
            throw error;
        }
    }

    // =======================================
    // MÉTODOS DE CREACIÓN DE MOVIMIENTOS
    // =======================================

    /**
     * Crear movimiento de entrada
     * @param {object} movimientoData - Datos del movimiento
     * @param {array} items - Array de items con cantidad
     */
    static async crearEntrada(movimientoData, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('La bodega de destino es requerida para entradas');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Crear el movimiento principal
            const movimientoQuery = `
                INSERT INTO Movimientos (
                    Tipo_Movimiento, Usuario_Id, Destino_Bodega_Id, 
                    Recepcionista, Motivo, Observaciones
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [movimientoResult] = await connection.execute(movimientoQuery, [
                'Entrada',
                movimientoData.Usuario_Id,
                movimientoData.Destino_Bodega_Id,
                movimientoData.Recepcionista || null,
                movimientoData.Motivo || null,
                movimientoData.Observaciones || null
            ]);

            const movimientoId = movimientoResult.insertId;

            // Crear el detalle y actualizar existencias
            for (const item of items) {
                if (!item.Item_Id || !item.Cantidad || item.Cantidad <= 0) {
                    throw new Error('Cada item debe tener ID y cantidad válida');
                }

                // Insertar detalle (el trigger se encargará de actualizar existencias automáticamente)
                const detalleQuery = `
                    INSERT INTO Movimientos_Detalle (Movimiento_Id, Item_Id, Cantidad)
                    VALUES (?, ?, ?)
                `;
                
                await connection.execute(detalleQuery, [
                    movimientoId, 
                    item.Item_Id, 
                    item.Cantidad
                ]);
            }

            await connection.commit();
            return movimientoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Crear movimiento de salida
     * @param {object} movimientoData - Datos del movimiento
     * @param {array} items - Array de items con cantidad
     */
    static async crearSalida(movimientoData, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones
            if (!movimientoData.Origen_Bodega_Id) {
                throw new Error('La bodega de origen es requerida para salidas');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validar stock suficiente para cada item
            for (const item of items) {
                if (!item.Item_Id || !item.Cantidad || item.Cantidad <= 0) {
                    throw new Error('Cada item debe tener ID y cantidad válida');
                }

                const [stockRows] = await connection.execute(
                    'SELECT IFNULL(Cantidad, 0) as Stock_Actual FROM Existencias WHERE Bodega_Id = ? AND Item_Id = ?',
                    [movimientoData.Origen_Bodega_Id, item.Item_Id]
                );

                const stockActual = stockRows.length > 0 ? stockRows[0].Stock_Actual : 0;
                
                if (stockActual < item.Cantidad) {
                    // Obtener nombre del item para error más descriptivo
                    const [itemRows] = await connection.execute(
                        'SELECT Item_Nombre FROM Items WHERE Item_Id = ?',
                        [item.Item_Id]
                    );
                    const itemNombre = itemRows.length > 0 ? itemRows[0].Item_Nombre : `Item ID ${item.Item_Id}`;
                    
                    throw new Error(`Stock insuficiente para ${itemNombre}. Stock actual: ${stockActual}, Solicitado: ${item.Cantidad}`);
                }
            }

            // Crear el movimiento principal
            const movimientoQuery = `
                INSERT INTO Movimientos (
                    Tipo_Movimiento, Usuario_Id, Origen_Bodega_Id, 
                    Recepcionista, Motivo, Observaciones
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [movimientoResult] = await connection.execute(movimientoQuery, [
                'Salida',
                movimientoData.Usuario_Id,
                movimientoData.Origen_Bodega_Id,
                movimientoData.Recepcionista || null,
                movimientoData.Motivo || null,
                movimientoData.Observaciones || null
            ]);

            const movimientoId = movimientoResult.insertId;

            // Crear el detalle y actualizar existencias
            for (const item of items) {
                // Insertar detalle (el trigger se encargará de actualizar existencias automáticamente)
                const detalleQuery = `
                    INSERT INTO Movimientos_Detalle (Movimiento_Id, Item_Id, Cantidad)
                    VALUES (?, ?, ?)
                `;
                
                await connection.execute(detalleQuery, [
                    movimientoId, 
                    item.Item_Id, 
                    item.Cantidad
                ]);
            }

            await connection.commit();
            return movimientoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Crear movimiento de transferencia
     * @param {object} movimientoData - Datos del movimiento
     * @param {array} items - Array de items con cantidad
     */
    static async crearTransferencia(movimientoData, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones
            if (!movimientoData.Origen_Bodega_Id || !movimientoData.Destino_Bodega_Id) {
                throw new Error('Las bodegas de origen y destino son requeridas para transferencias');
            }

            if (movimientoData.Origen_Bodega_Id === movimientoData.Destino_Bodega_Id) {
                throw new Error('Las bodegas de origen y destino deben ser diferentes');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validar stock suficiente en origen
            for (const item of items) {
                if (!item.Item_Id || !item.Cantidad || item.Cantidad <= 0) {
                    throw new Error('Cada item debe tener ID y cantidad válida');
                }

                const [stockRows] = await connection.execute(
                    'SELECT IFNULL(Cantidad, 0) as Stock_Actual FROM Existencias WHERE Bodega_Id = ? AND Item_Id = ?',
                    [movimientoData.Origen_Bodega_Id, item.Item_Id]
                );

                const stockActual = stockRows.length > 0 ? stockRows[0].Stock_Actual : 0;
                
                if (stockActual < item.Cantidad) {
                    const [itemRows] = await connection.execute(
                        'SELECT Item_Nombre FROM Items WHERE Item_Id = ?',
                        [item.Item_Id]
                    );
                    const itemNombre = itemRows.length > 0 ? itemRows[0].Item_Nombre : `Item ID ${item.Item_Id}`;
                    
                    throw new Error(`Stock insuficiente en bodega origen para ${itemNombre}. Stock actual: ${stockActual}, Solicitado: ${item.Cantidad}`);
                }
            }

            // Crear el movimiento principal
            const movimientoQuery = `
                INSERT INTO Movimientos (
                    Tipo_Movimiento, Usuario_Id, Origen_Bodega_Id, Destino_Bodega_Id,
                    Recepcionista, Motivo, Observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            const [movimientoResult] = await connection.execute(movimientoQuery, [
                'Transferencia',
                movimientoData.Usuario_Id,
                movimientoData.Origen_Bodega_Id,
                movimientoData.Destino_Bodega_Id,
                movimientoData.Recepcionista || null,
                movimientoData.Motivo || null,
                movimientoData.Observaciones || null
            ]);

            const movimientoId = movimientoResult.insertId;

            // Crear el detalle y actualizar existencias
            for (const item of items) {
                // Insertar detalle (el trigger se encargará de actualizar existencias automáticamente)
                const detalleQuery = `
                    INSERT INTO Movimientos_Detalle (Movimiento_Id, Item_Id, Cantidad)
                    VALUES (?, ?, ?)
                `;
                
                await connection.execute(detalleQuery, [
                    movimientoId, 
                    item.Item_Id, 
                    item.Cantidad
                ]);
            }

            await connection.commit();
            return movimientoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Crear movimiento de ajuste (para correcciones de inventario)
     * @param {object} movimientoData - Datos del movimiento
     * @param {array} items - Array de items con cantidad (cantidad final deseada)
     */
    static async crearAjuste(movimientoData, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('La bodega es requerida para ajustes');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validar que se proporcione motivo para ajustes
            if (!movimientoData.Motivo) {
                throw new Error('El motivo es obligatorio para ajustes de inventario');
            }

            // Crear el movimiento principal
            const movimientoQuery = `
                INSERT INTO Movimientos (
                    Tipo_Movimiento, Usuario_Id, Destino_Bodega_Id,
                    Recepcionista, Motivo, Observaciones
                ) VALUES (?, ?, ?, ?, ?, ?)
            `;

            const [movimientoResult] = await connection.execute(movimientoQuery, [
                'Ajuste',
                movimientoData.Usuario_Id,
                movimientoData.Destino_Bodega_Id,
                movimientoData.Recepcionista || null,
                movimientoData.Motivo,
                movimientoData.Observaciones || null
            ]);

            const movimientoId = movimientoResult.insertId;

            // Procesar cada item del ajuste
            for (const item of items) {
                if (!item.Item_Id || item.Cantidad === undefined || item.Cantidad < 0) {
                    throw new Error('Cada item debe tener ID y cantidad válida (>= 0)');
                }

                // Obtener cantidad actual
                const [stockRows] = await connection.execute(
                    'SELECT IFNULL(Cantidad, 0) as Stock_Actual FROM Existencias WHERE Bodega_Id = ? AND Item_Id = ?',
                    [movimientoData.Destino_Bodega_Id, item.Item_Id]
                );

                const stockActual = stockRows.length > 0 ? stockRows[0].Stock_Actual : 0;
                const diferencia = item.Cantidad - stockActual;

                // Solo registrar el movimiento si hay diferencia
                if (diferencia !== 0) {
                    // Insertar detalle con la cantidad final (el trigger se encarga de actualizar existencias)
                    const detalleQuery = `
                        INSERT INTO Movimientos_Detalle (Movimiento_Id, Item_Id, Cantidad)
                        VALUES (?, ?, ?)
                    `;
                    
                    await connection.execute(detalleQuery, [
                        movimientoId, 
                        item.Item_Id, 
                        item.Cantidad // Para ajustes, guardamos la cantidad final que se quiere
                    ]);
                }
            }

            await connection.commit();
            return movimientoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // MÉTODOS DE CONSULTA ESPECIALIZADOS
    // =======================================

    /**
     * Obtener kardex de un item específico
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega (opcional)
     * @param {string} fechaInicio - Fecha inicial
     * @param {string} fechaFin - Fecha final
     */
    static async getKardexItem(itemId, bodegaId = null, fechaInicio = null, fechaFin = null) {
        try {
            let whereClause = 'WHERE md.Item_Id = ?';
            let params = [itemId];

            if (bodegaId) {
                whereClause += ' AND (m.Origen_Bodega_Id = ? OR m.Destino_Bodega_Id = ?)';
                params.push(bodegaId, bodegaId);
            }

            if (fechaInicio) {
                whereClause += ' AND DATE(m.Fecha) >= ?';
                params.push(fechaInicio);
            }

            if (fechaFin) {
                whereClause += ' AND DATE(m.Fecha) <= ?';
                params.push(fechaFin);
            }

            const query = `
                SELECT 
                    m.Movimiento_Id,
                    m.Tipo_Movimiento,
                    m.Fecha,
                    m.Motivo,
                    md.Cantidad,
                    bo.Bodega_Nombre as Bodega_Origen,
                    bd.Bodega_Nombre as Bodega_Destino,
                    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Usuario,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU
                FROM Movimientos m
                INNER JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
                INNER JOIN Items i ON md.Item_Id = i.Item_Id
                INNER JOIN Usuarios u ON m.Usuario_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON m.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON m.Destino_Bodega_Id = bd.Bodega_Id
                ${whereClause}
                ORDER BY m.Fecha ASC
            `;

            const [rows] = await db.execute(query, params);
            return rows;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener resumen de movimientos por período
     * @param {string} fechaInicio - Fecha inicial
     * @param {string} fechaFin - Fecha final
     * @param {string} tipoMovimiento - Tipo específico (opcional)
     */
    static async getResumenPorPeriodo(fechaInicio, fechaFin, tipoMovimiento = null) {
        try {
            let whereClause = 'WHERE DATE(m.Fecha) BETWEEN ? AND ?';
            let params = [fechaInicio, fechaFin];

            if (tipoMovimiento) {
                whereClause += ' AND m.Tipo_Movimiento = ?';
                params.push(tipoMovimiento);
            }

            const query = `
                SELECT 
                    m.Tipo_Movimiento,
                    COUNT(DISTINCT m.Movimiento_Id) as Total_Movimientos,
                    SUM(md.Cantidad) as Total_Cantidad,
                    COUNT(DISTINCT md.Item_Id) as Items_Diferentes,
                    COUNT(DISTINCT COALESCE(m.Origen_Bodega_Id, m.Destino_Bodega_Id)) as Bodegas_Afectadas
                FROM Movimientos m
                INNER JOIN Movimientos_Detalle md ON m.Movimiento_Id = md.Movimiento_Id
                ${whereClause}
                GROUP BY m.Tipo_Movimiento
                ORDER BY Total_Movimientos DESC
            `;

            const [rows] = await db.execute(query, params);
            return rows;

        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener stock actual de un item en una bodega específica
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    static async getStockActual(itemId, bodegaId) {
        try {
            const [rows] = await db.execute(
                'SELECT IFNULL(Cantidad, 0) as Stock_Actual FROM Existencias WHERE Item_Id = ? AND Bodega_Id = ?',
                [itemId, bodegaId]
            );

            return rows.length > 0 ? rows[0].Stock_Actual : 0;

        } catch (error) {
            throw error;
        }
    }
}

module.exports = MovimientoModel;