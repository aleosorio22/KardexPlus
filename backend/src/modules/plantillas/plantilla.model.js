const db = require('../../core/config/database');

class PlantillaModel {
    
    // =======================================
    // CONSULTAS Y BÚSQUEDAS
    // =======================================

    /**
     * Obtener todas las plantillas con filtros opcionales
     * @param {object} filters - Filtros de búsqueda
     * @param {number} usuarioId - ID del usuario para validar acceso
     */
    static async findAll(filters = {}, usuarioId = null) {
        const connection = await db.getConnection();
        
        try {
            let whereConditions = ['p.Activo = 1']; // Solo plantillas activas
            let params = [];

            // Filtrar por tipo de plantilla
            if (filters.tipo_plantilla) {
                whereConditions.push('p.Tipo_Plantilla = ?');
                params.push(filters.tipo_plantilla);
            }

            // Filtrar por subtipo (para movimientos)
            if (filters.subtipo_plantilla) {
                whereConditions.push('p.Subtipo_Plantilla = ?');
                params.push(filters.subtipo_plantilla);
            }

            // Filtrar por bodega origen
            if (filters.origen_bodega_id) {
                whereConditions.push('p.Origen_Bodega_Id = ?');
                params.push(filters.origen_bodega_id);
            }

            // Filtrar por bodega destino
            if (filters.destino_bodega_id) {
                whereConditions.push('p.Destino_Bodega_Id = ?');
                params.push(filters.destino_bodega_id);
            }

            // Búsqueda por texto (nombre o descripción)
            if (filters.search) {
                whereConditions.push('(p.Plantilla_Nombre LIKE ? OR p.Plantilla_Descripcion LIKE ?)');
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            // Filtrar por usuario asignado (si se proporciona usuarioId y no tiene permiso ver_todas)
            if (usuarioId && !filters.ver_todas) {
                whereConditions.push(`
                    EXISTS (
                        SELECT 1 FROM Plantillas_Usuarios pu 
                        WHERE pu.Plantilla_Id = p.Plantilla_Id 
                        AND pu.Usuario_Id = ?
                    )
                `);
                params.push(usuarioId);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            const query = `
                SELECT 
                    p.*,
                    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Creador_Nombre_Completo,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre,
                    COUNT(DISTINCT pd.Plantilla_Detalle_Id) as Total_Items,
                    COUNT(DISTINCT pu.Usuario_Id) as Total_Usuarios_Asignados
                FROM Plantillas p
                INNER JOIN Usuarios u ON p.Usuario_Creador_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON p.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON p.Destino_Bodega_Id = bd.Bodega_Id
                LEFT JOIN Plantillas_Detalle pd ON p.Plantilla_Id = pd.Plantilla_Id
                LEFT JOIN Plantillas_Usuarios pu ON p.Plantilla_Id = pu.Plantilla_Id
                ${whereClause}
                GROUP BY p.Plantilla_Id
                ORDER BY p.Fecha_Creacion DESC
            `;

            const [rows] = await connection.execute(query, params);
            return rows;

        } finally {
            connection.release();
        }
    }

    /**
     * Obtener una plantilla por ID con detalle completo
     * @param {number} plantillaId - ID de la plantilla
     */
    static async findById(plantillaId) {
        const connection = await db.getConnection();
        
        try {
            // Obtener datos principales de la plantilla
            const [plantillaRows] = await connection.execute(`
                SELECT 
                    p.*,
                    CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Creador_Nombre_Completo,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre
                FROM Plantillas p
                INNER JOIN Usuarios u ON p.Usuario_Creador_Id = u.Usuario_Id
                LEFT JOIN Bodegas bo ON p.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON p.Destino_Bodega_Id = bd.Bodega_Id
                WHERE p.Plantilla_Id = ? AND p.Activo = 1
            `, [plantillaId]);

            if (plantillaRows.length === 0) {
                return null;
            }

            const plantilla = plantillaRows[0];

            // Obtener detalle de items de la plantilla
            const [detalleRows] = await connection.execute(`
                SELECT 
                    pd.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU as Item_Codigo,
                    i.Item_Codigo_Barra,
                    c.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    ip.Presentacion_Nombre,
                    ip.Cantidad_Base as Factor_Conversion
                FROM Plantillas_Detalle pd
                INNER JOIN Items i ON pd.Item_Id = i.Item_Id
                LEFT JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
                LEFT JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Presentaciones ip ON pd.Item_Presentaciones_Id = ip.Item_Presentaciones_Id
                WHERE pd.Plantilla_Id = ?
                ORDER BY pd.Orden ASC, i.Item_Nombre ASC
            `, [plantillaId]);

            // Obtener usuarios asignados a la plantilla
            const [usuariosRows] = await connection.execute(`
                SELECT 
                    pu.*,
                    u.Usuario_Nombre,
                    u.Usuario_Apellido,
                    u.Usuario_Correo,
                    r.Rol_Nombre,
                    CONCAT(u_asignador.Usuario_Nombre, ' ', u_asignador.Usuario_Apellido) as Asignado_Por_Nombre
                FROM Plantillas_Usuarios pu
                INNER JOIN Usuarios u ON pu.Usuario_Id = u.Usuario_Id
                LEFT JOIN Roles r ON u.Rol_Id = r.Rol_Id
                LEFT JOIN Usuarios u_asignador ON pu.Asignado_Por_Usuario_Id = u_asignador.Usuario_Id
                WHERE pu.Plantilla_Id = ?
                ORDER BY u.Usuario_Nombre, u.Usuario_Apellido
            `, [plantillaId]);

            plantilla.detalle = detalleRows;
            plantilla.usuarios_asignados = usuariosRows;
            
            return plantilla;

        } finally {
            connection.release();
        }
    }

    /**
     * Verificar si un usuario tiene acceso a una plantilla
     * @param {number} plantillaId - ID de la plantilla
     * @param {number} usuarioId - ID del usuario
     */
    static async verificarAccesoUsuario(plantillaId, usuarioId) {
        const connection = await db.getConnection();
        
        try {
            // Verificar si el usuario es el creador
            const [creadorRows] = await connection.execute(
                'SELECT Usuario_Creador_Id FROM Plantillas WHERE Plantilla_Id = ?',
                [plantillaId]
            );

            if (creadorRows.length === 0) {
                return { tieneAcceso: false, esCreador: false, puedeModificar: false };
            }

            const esCreador = creadorRows[0].Usuario_Creador_Id === usuarioId;

            // Verificar si está asignado a la plantilla
            const [asignacionRows] = await connection.execute(
                'SELECT Puede_Modificar FROM Plantillas_Usuarios WHERE Plantilla_Id = ? AND Usuario_Id = ?',
                [plantillaId, usuarioId]
            );

            const estaAsignado = asignacionRows.length > 0;
            const puedeModificar = estaAsignado ? asignacionRows[0].Puede_Modificar : false;

            return {
                tieneAcceso: esCreador || estaAsignado,
                esCreador,
                estaAsignado,
                puedeModificar: esCreador || puedeModificar
            };

        } finally {
            connection.release();
        }
    }

    // =======================================
    // CREACIÓN DE PLANTILLAS
    // =======================================

    /**
     * Crear una nueva plantilla
     * @param {object} plantillaData - Datos de la plantilla
     * @param {array} items - Array de items con cantidades
     * @param {array} usuariosAsignados - Array de IDs de usuarios a asignar (opcional)
     */
    static async crear(plantillaData, items, usuariosAsignados = []) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validaciones
            if (!plantillaData.Plantilla_Nombre || !plantillaData.Plantilla_Nombre.trim()) {
                throw new Error('El nombre de la plantilla es requerido');
            }

            if (!plantillaData.Tipo_Plantilla) {
                throw new Error('El tipo de plantilla es requerido');
            }

            // Permitir crear plantillas sin items inicialmente
            // Los items se pueden agregar después con actualizarItems()
            // if (!items || items.length === 0) {
            //     throw new Error('Debe especificar al menos un item para la plantilla');
            // }

            // Validar tipo de plantilla
            const tiposValidos = ['Requerimiento', 'Movimiento', 'Compra'];
            if (!tiposValidos.includes(plantillaData.Tipo_Plantilla)) {
                throw new Error('Tipo de plantilla inválido');
            }

            // Crear la plantilla principal
            const plantillaQuery = `
                INSERT INTO Plantillas (
                    Plantilla_Nombre,
                    Plantilla_Descripcion,
                    Tipo_Plantilla,
                    Subtipo_Plantilla,
                    Origen_Bodega_Id,
                    Destino_Bodega_Id,
                    Configuracion_Adicional,
                    Usuario_Creador_Id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const configuracionAdicional = plantillaData.Configuracion_Adicional 
                ? JSON.stringify(plantillaData.Configuracion_Adicional) 
                : null;

            const [plantillaResult] = await connection.execute(plantillaQuery, [
                plantillaData.Plantilla_Nombre.trim(),
                plantillaData.Plantilla_Descripcion?.trim() || null,
                plantillaData.Tipo_Plantilla,
                plantillaData.Subtipo_Plantilla || null,
                plantillaData.Origen_Bodega_Id || null,
                plantillaData.Destino_Bodega_Id || null,
                configuracionAdicional,
                plantillaData.Usuario_Creador_Id
            ]);

            const plantillaId = plantillaResult.insertId;

            // Insertar items del detalle (si se proporcionaron)
            if (items && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // Validar item
                if (!item.Item_Id) {
                    throw new Error(`Item en posición ${i + 1}: ID de item es requerido`);
                }

                if (!item.Cantidad || parseFloat(item.Cantidad) <= 0) {
                    throw new Error(`Item en posición ${i + 1}: Cantidad debe ser mayor a 0`);
                }

                // Validar que el item existe
                const [itemExists] = await connection.execute(
                    'SELECT Item_Id FROM Items WHERE Item_Id = ?',
                    [item.Item_Id]
                );

                if (itemExists.length === 0) {
                    throw new Error(`Item en posición ${i + 1}: El item con ID ${item.Item_Id} no existe`);
                }

                // Si es por presentación, validar que la presentación existe y pertenece al item
                if (item.Es_Por_Presentacion && item.Item_Presentaciones_Id) {
                    const [presentacionExists] = await connection.execute(
                        'SELECT Item_Presentaciones_Id FROM Items_Presentaciones WHERE Item_Presentaciones_Id = ? AND Item_Id = ?',
                        [item.Item_Presentaciones_Id, item.Item_Id]
                    );

                    if (presentacionExists.length === 0) {
                        throw new Error(`Item en posición ${i + 1}: La presentación con ID ${item.Item_Presentaciones_Id} no existe o no pertenece al item ${item.Item_Id}`);
                    }

                    if (!item.Cantidad_Presentacion || parseFloat(item.Cantidad_Presentacion) <= 0) {
                        throw new Error(`Item en posición ${i + 1}: Cantidad_Presentacion debe ser mayor a 0 cuando Es_Por_Presentacion es true`);
                    }
                }

                const detalleQuery = `
                    INSERT INTO Plantillas_Detalle (
                        Plantilla_Id,
                        Item_Id,
                        Cantidad,
                        Item_Presentaciones_Id,
                        Cantidad_Presentacion,
                        Es_Por_Presentacion,
                        Orden
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                await connection.execute(detalleQuery, [
                    plantillaId,
                    item.Item_Id,
                    parseFloat(item.Cantidad),
                    item.Item_Presentaciones_Id || null,
                    item.Cantidad_Presentacion ? parseFloat(item.Cantidad_Presentacion) : null,
                    item.Es_Por_Presentacion ? 1 : 0,
                    item.Orden || i
                ]);
            }
            } // Cerrar if (items && items.length > 0)

            // Asignar usuarios si se proporcionaron
            if (usuariosAsignados && usuariosAsignados.length > 0) {
                // Validar que todos los usuarios existen
                for (const usuarioId of usuariosAsignados) {
                    const [usuarioExists] = await connection.execute(
                        'SELECT Usuario_Id FROM Usuarios WHERE Usuario_Id = ?',
                        [usuarioId]
                    );

                    if (usuarioExists.length === 0) {
                        throw new Error(`El usuario con ID ${usuarioId} no existe`);
                    }
                }

                // Insertar asignaciones
                for (const usuarioId of usuariosAsignados) {
                    const asignacionQuery = `
                        INSERT INTO Plantillas_Usuarios (
                            Plantilla_Id,
                            Usuario_Id,
                            Puede_Modificar,
                            Asignado_Por_Usuario_Id
                        ) VALUES (?, ?, ?, ?)
                    `;

                    await connection.execute(asignacionQuery, [
                        plantillaId,
                        usuarioId,
                        0, // Por defecto no pueden modificar
                        plantillaData.Usuario_Creador_Id
                    ]);
                }
            }

            await connection.commit();
            return plantillaId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // EDICIÓN DE PLANTILLAS
    // =======================================

    /**
     * Actualizar datos principales de una plantilla
     * @param {number} plantillaId - ID de la plantilla
     * @param {object} plantillaData - Datos a actualizar
     */
    static async actualizar(plantillaId, plantillaData) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validar que la plantilla existe
            const [plantillaRows] = await connection.execute(
                'SELECT Plantilla_Id FROM Plantillas WHERE Plantilla_Id = ? AND Activo = 1',
                [plantillaId]
            );

            if (plantillaRows.length === 0) {
                throw new Error('Plantilla no encontrada');
            }

            // Construir query dinámico
            const camposActualizables = [];
            const valores = [];

            if (plantillaData.Plantilla_Nombre !== undefined) {
                camposActualizables.push('Plantilla_Nombre = ?');
                valores.push(plantillaData.Plantilla_Nombre.trim());
            }

            if (plantillaData.Plantilla_Descripcion !== undefined) {
                camposActualizables.push('Plantilla_Descripcion = ?');
                valores.push(plantillaData.Plantilla_Descripcion?.trim() || null);
            }

            if (plantillaData.Subtipo_Plantilla !== undefined) {
                camposActualizables.push('Subtipo_Plantilla = ?');
                valores.push(plantillaData.Subtipo_Plantilla || null);
            }

            if (plantillaData.Origen_Bodega_Id !== undefined) {
                camposActualizables.push('Origen_Bodega_Id = ?');
                valores.push(plantillaData.Origen_Bodega_Id || null);
            }

            if (plantillaData.Destino_Bodega_Id !== undefined) {
                camposActualizables.push('Destino_Bodega_Id = ?');
                valores.push(plantillaData.Destino_Bodega_Id || null);
            }

            if (plantillaData.Configuracion_Adicional !== undefined) {
                camposActualizables.push('Configuracion_Adicional = ?');
                valores.push(plantillaData.Configuracion_Adicional 
                    ? JSON.stringify(plantillaData.Configuracion_Adicional) 
                    : null);
            }

            if (camposActualizables.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            // Actualizar plantilla
            const updateQuery = `
                UPDATE Plantillas 
                SET ${camposActualizables.join(', ')}
                WHERE Plantilla_Id = ?
            `;

            valores.push(plantillaId);
            await connection.execute(updateQuery, valores);

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar items de la plantilla (reemplaza todos los items)
     * @param {number} plantillaId - ID de la plantilla
     * @param {array} items - Array de items con cantidades
     */
    static async actualizarItems(plantillaId, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validar que la plantilla existe
            const [plantillaRows] = await connection.execute(
                'SELECT Plantilla_Id FROM Plantillas WHERE Plantilla_Id = ? AND Activo = 1',
                [plantillaId]
            );

            if (plantillaRows.length === 0) {
                throw new Error('Plantilla no encontrada');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Eliminar items existentes
            await connection.execute(
                'DELETE FROM Plantillas_Detalle WHERE Plantilla_Id = ?',
                [plantillaId]
            );

            // Insertar nuevos items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                if (!item.Item_Id || !item.Cantidad || parseFloat(item.Cantidad) <= 0) {
                    throw new Error(`Item en posición ${i + 1}: Datos inválidos`);
                }

                // Validar que el item existe
                const [itemExists] = await connection.execute(
                    'SELECT Item_Id FROM Items WHERE Item_Id = ?',
                    [item.Item_Id]
                );

                if (itemExists.length === 0) {
                    throw new Error(`Item en posición ${i + 1}: El item con ID ${item.Item_Id} no existe`);
                }

                // Si es por presentación, validar que la presentación existe
                if (item.Es_Por_Presentacion && item.Item_Presentaciones_Id) {
                    const [presentacionExists] = await connection.execute(
                        'SELECT Item_Presentaciones_Id FROM Items_Presentaciones WHERE Item_Presentaciones_Id = ? AND Item_Id = ?',
                        [item.Item_Presentaciones_Id, item.Item_Id]
                    );

                    if (presentacionExists.length === 0) {
                        throw new Error(`Item en posición ${i + 1}: La presentación con ID ${item.Item_Presentaciones_Id} no existe o no pertenece al item`);
                    }
                }

                const detalleQuery = `
                    INSERT INTO Plantillas_Detalle (
                        Plantilla_Id,
                        Item_Id,
                        Cantidad,
                        Item_Presentaciones_Id,
                        Cantidad_Presentacion,
                        Es_Por_Presentacion,
                        Orden
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `;

                await connection.execute(detalleQuery, [
                    plantillaId,
                    item.Item_Id,
                    parseFloat(item.Cantidad),
                    item.Item_Presentaciones_Id || null,
                    item.Cantidad_Presentacion ? parseFloat(item.Cantidad_Presentacion) : null,
                    item.Es_Por_Presentacion ? 1 : 0,
                    item.Orden || i
                ]);
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // GESTIÓN DE USUARIOS ASIGNADOS
    // =======================================

    /**
     * Asignar usuarios a una plantilla
     * @param {number} plantillaId - ID de la plantilla
     * @param {array} usuariosIds - Array de IDs de usuarios
     * @param {number} asignadoPorUsuarioId - ID del usuario que asigna
     */
    static async asignarUsuarios(plantillaId, usuariosIds, asignadoPorUsuarioId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validar que la plantilla existe
            const [plantillaRows] = await connection.execute(
                'SELECT Plantilla_Id FROM Plantillas WHERE Plantilla_Id = ? AND Activo = 1',
                [plantillaId]
            );

            if (plantillaRows.length === 0) {
                throw new Error('Plantilla no encontrada');
            }

            if (!usuariosIds || usuariosIds.length === 0) {
                throw new Error('Debe especificar al menos un usuario');
            }

            // Validar que todos los usuarios existen
            for (const usuarioId of usuariosIds) {
                const [usuarioExists] = await connection.execute(
                    'SELECT Usuario_Id FROM Usuarios WHERE Usuario_Id = ?',
                    [usuarioId]
                );

                if (usuarioExists.length === 0) {
                    throw new Error(`El usuario con ID ${usuarioId} no existe`);
                }
            }

            // Asignar cada usuario
            for (const usuarioId of usuariosIds) {
                // Verificar si ya está asignado
                const [existente] = await connection.execute(
                    'SELECT Plantilla_Usuario_Id FROM Plantillas_Usuarios WHERE Plantilla_Id = ? AND Usuario_Id = ?',
                    [plantillaId, usuarioId]
                );

                if (existente.length === 0) {
                    // No existe, insertar
                    await connection.execute(`
                        INSERT INTO Plantillas_Usuarios (
                            Plantilla_Id,
                            Usuario_Id,
                            Puede_Modificar,
                            Asignado_Por_Usuario_Id
                        ) VALUES (?, ?, ?, ?)
                    `, [plantillaId, usuarioId, 0, asignadoPorUsuarioId]);
                }
                // Si ya existe, no hacer nada (evitar duplicados)
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Desasignar usuarios de una plantilla
     * @param {number} plantillaId - ID de la plantilla
     * @param {array} usuariosIds - Array de IDs de usuarios a desasignar
     */
    static async desasignarUsuarios(plantillaId, usuariosIds) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            if (!usuariosIds || usuariosIds.length === 0) {
                throw new Error('Debe especificar al menos un usuario');
            }

            // Construir placeholders para IN clause
            const placeholders = usuariosIds.map(() => '?').join(',');
            
            await connection.execute(
                `DELETE FROM Plantillas_Usuarios 
                 WHERE Plantilla_Id = ? AND Usuario_Id IN (${placeholders})`,
                [plantillaId, ...usuariosIds]
            );

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Actualizar permisos de un usuario sobre una plantilla
     * @param {number} plantillaId - ID de la plantilla
     * @param {number} usuarioId - ID del usuario
     * @param {boolean} puedeModificar - Si puede modificar la plantilla
     */
    static async actualizarPermisosUsuario(plantillaId, usuarioId, puedeModificar) {
        const connection = await db.getConnection();
        
        try {
            await connection.execute(
                'UPDATE Plantillas_Usuarios SET Puede_Modificar = ? WHERE Plantilla_Id = ? AND Usuario_Id = ?',
                [puedeModificar ? 1 : 0, plantillaId, usuarioId]
            );

            return true;

        } finally {
            connection.release();
        }
    }

    // =======================================
    // ELIMINACIÓN (SOFT DELETE)
    // =======================================

    /**
     * Desactivar una plantilla (soft delete)
     * @param {number} plantillaId - ID de la plantilla
     */
    static async eliminar(plantillaId) {
        const connection = await db.getConnection();
        
        try {
            await connection.execute(
                'UPDATE Plantillas SET Activo = 0 WHERE Plantilla_Id = ?',
                [plantillaId]
            );

            return true;

        } finally {
            connection.release();
        }
    }

    // =======================================
    // ESTADÍSTICAS Y REPORTES
    // =======================================

    /**
     * Obtener estadísticas generales de plantillas
     */
    static async getEstadisticas() {
        const connection = await db.getConnection();
        
        try {
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as Total_Plantillas,
                    SUM(CASE WHEN Tipo_Plantilla = 'Requerimiento' THEN 1 ELSE 0 END) as Total_Requerimientos,
                    SUM(CASE WHEN Tipo_Plantilla = 'Movimiento' THEN 1 ELSE 0 END) as Total_Movimientos,
                    SUM(CASE WHEN Tipo_Plantilla = 'Compra' THEN 1 ELSE 0 END) as Total_Compras,
                    COUNT(DISTINCT Usuario_Creador_Id) as Total_Creadores
                FROM Plantillas
                WHERE Activo = 1
            `);

            return stats[0];

        } finally {
            connection.release();
        }
    }
}

module.exports = PlantillaModel;
