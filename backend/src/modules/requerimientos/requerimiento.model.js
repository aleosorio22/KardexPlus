const db = require('../../core/config/database');

class RequerimientoModel {
    
    // =======================================
    // FUNCIÓN AUXILIAR PARA CÁLCULOS
    // =======================================

    /**
     * Calcular cantidad en unidades base para un item en requerimientos
     * @param {object} connection - Conexión a la base de datos
     * @param {object} item - Item con datos de presentación
     * @returns {object} - Datos calculados del item
     */
    static async calcularCantidadItem(connection, item) {
        // Si no es por presentación, retornar tal como está
        if (!item.Item_Presentaciones_Id || !item.Es_Requerimiento_Por_Presentacion) {
            return {
                cantidadBase: item.Cantidad_Solicitada || 0,
                esPorPresentacion: false,
                datosOriginales: item
            };
        }

        // Obtener la cantidad base de la presentación
        const [presentacionRows] = await connection.execute(
            'SELECT Cantidad_Base FROM Items_Presentaciones WHERE Item_Presentaciones_Id = ?',
            [item.Item_Presentaciones_Id]
        );

        if (presentacionRows.length === 0) {
            throw new Error(`Presentación ${item.Item_Presentaciones_Id} no encontrada`);
        }

        const cantidadBase = presentacionRows[0].Cantidad_Base;
        const cantidadTotalBase = item.Cantidad_Solicitada_Presentacion * cantidadBase;

        return {
            cantidadBase: cantidadTotalBase,
            cantidadPresentacion: item.Cantidad_Solicitada_Presentacion,
            factorConversion: cantidadBase,
            esPorPresentacion: true,
            datosOriginales: item
        };
    }

    // =======================================
    // CONSULTAS Y BÚSQUEDAS
    // =======================================

    /**
     * Obtener todos los requerimientos con filtros opcionales
     */
    static async findAll(filters = {}) {
        const connection = await db.getConnection();
        
        try {
            let whereConditions = [];
            let params = [];

            // Aplicar filtros
            if (filters.estado) {
                whereConditions.push('r.Estado = ?');
                params.push(filters.estado);
            }

            if (filters.usuario_solicita_id) {
                whereConditions.push('r.Usuario_Solicita_Id = ?');
                params.push(filters.usuario_solicita_id);
            }

            if (filters.bodega_origen_id) {
                whereConditions.push('r.Origen_Bodega_Id = ?');
                params.push(filters.bodega_origen_id);
            }

            if (filters.bodega_destino_id) {
                whereConditions.push('r.Destino_Bodega_Id = ?');
                params.push(filters.bodega_destino_id);
            }

            if (filters.fecha_inicio && filters.fecha_fin) {
                whereConditions.push('DATE(r.Fecha) BETWEEN ? AND ?');
                params.push(filters.fecha_inicio, filters.fecha_fin);
            }

            const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

            const [rows] = await connection.execute(`
                SELECT 
                    r.*,
                    u_solicita.Usuario_Nombre as Usuario_Solicita_Nombre,
                    u_solicita.Usuario_Apellido as Usuario_Solicita_Apellido,
                    u_aprueba.Usuario_Nombre as Usuario_Aprueba_Nombre,
                    u_aprueba.Usuario_Apellido as Usuario_Aprueba_Apellido,
                    u_despacha.Usuario_Nombre as Usuario_Despacha_Nombre,
                    u_despacha.Usuario_Apellido as Usuario_Despacha_Apellido,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre,
                    COUNT(rd.Requerimiento_Detalle_Id) as Total_Items,
                    SUM(CASE WHEN rd.Cantidad_Despachada >= rd.Cantidad_Solicitada THEN 1 ELSE 0 END) as Items_Completados
                FROM Requerimientos r
                LEFT JOIN Usuarios u_solicita ON r.Usuario_Solicita_Id = u_solicita.Usuario_Id
                LEFT JOIN Usuarios u_aprueba ON r.Usuario_Aprueba_Id = u_aprueba.Usuario_Id
                LEFT JOIN Usuarios u_despacha ON r.Usuario_Despacha_Id = u_despacha.Usuario_Id
                LEFT JOIN Bodegas bo ON r.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON r.Destino_Bodega_Id = bd.Bodega_Id
                LEFT JOIN Requerimientos_Detalle rd ON r.Requerimiento_Id = rd.Requerimiento_Id
                ${whereClause}
                GROUP BY r.Requerimiento_Id
                ORDER BY r.Fecha DESC
            `, params);

            return rows;

        } finally {
            connection.release();
        }
    }

    /**
     * Obtener un requerimiento por ID con todo su detalle
     */
    static async findById(requerimientoId) {
        const connection = await db.getConnection();
        
        try {
            // Obtener datos principales del requerimiento
            const [requerimientoRows] = await connection.execute(`
                SELECT 
                    r.*,
                    u_solicita.Usuario_Nombre as Usuario_Solicita_Nombre,
                    u_solicita.Usuario_Apellido as Usuario_Solicita_Apellido,
                    u_aprueba.Usuario_Nombre as Usuario_Aprueba_Nombre,
                    u_aprueba.Usuario_Apellido as Usuario_Aprueba_Apellido,
                    u_despacha.Usuario_Nombre as Usuario_Despacha_Nombre,
                    u_despacha.Usuario_Apellido as Usuario_Despacha_Apellido,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre
                FROM Requerimientos r
                LEFT JOIN Usuarios u_solicita ON r.Usuario_Solicita_Id = u_solicita.Usuario_Id
                LEFT JOIN Usuarios u_aprueba ON r.Usuario_Aprueba_Id = u_aprueba.Usuario_Id
                LEFT JOIN Usuarios u_despacha ON r.Usuario_Despacha_Id = u_despacha.Usuario_Id
                LEFT JOIN Bodegas bo ON r.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON r.Destino_Bodega_Id = bd.Bodega_Id
                WHERE r.Requerimiento_Id = ?
            `, [requerimientoId]);

            if (requerimientoRows.length === 0) {
                throw new Error('Requerimiento no encontrado');
            }

            const requerimiento = requerimientoRows[0];

            // Obtener detalle del requerimiento
            const [detalleRows] = await connection.execute(`
                SELECT 
                    rd.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU as Item_Codigo,
                    i.Item_Nombre as Item_Descripcion,
                    i.Item_Codigo_Barra,
                    c.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    ip.Presentacion_Nombre,
                    ip.Cantidad_Base,
                    (rd.Cantidad_Solicitada - rd.Cantidad_Despachada) as Cantidad_Pendiente
                FROM Requerimientos_Detalle rd
                INNER JOIN Items i ON rd.Item_Id = i.Item_Id
                LEFT JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
                LEFT JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Presentaciones ip ON rd.Item_Presentaciones_Id = ip.Item_Presentaciones_Id
                WHERE rd.Requerimiento_Id = ?
                ORDER BY i.Item_Nombre
            `, [requerimientoId]);

            requerimiento.detalle = detalleRows;
            return requerimiento;

        } finally {
            connection.release();
        }
    }

    /**
     * Obtener un requerimiento por ID con validación de permisos y metadata
     */
    static async findByIdWithPermissions(requerimientoId, usuarioId) {
        const connection = await db.getConnection();
        
        try {
            // Obtener datos principales del requerimiento
            const [requerimientoRows] = await connection.execute(`
                SELECT 
                    r.*,
                    u_solicita.Usuario_Nombre as Usuario_Solicita_Nombre,
                    u_solicita.Usuario_Apellido as Usuario_Solicita_Apellido,
                    u_aprueba.Usuario_Nombre as Usuario_Aprueba_Nombre,
                    u_aprueba.Usuario_Apellido as Usuario_Aprueba_Apellido,
                    u_despacha.Usuario_Nombre as Usuario_Despacha_Nombre,
                    u_despacha.Usuario_Apellido as Usuario_Despacha_Apellido,
                    bo.Bodega_Nombre as Origen_Bodega_Nombre,
                    bd.Bodega_Nombre as Destino_Bodega_Nombre
                FROM Requerimientos r
                LEFT JOIN Usuarios u_solicita ON r.Usuario_Solicita_Id = u_solicita.Usuario_Id
                LEFT JOIN Usuarios u_aprueba ON r.Usuario_Aprueba_Id = u_aprueba.Usuario_Id
                LEFT JOIN Usuarios u_despacha ON r.Usuario_Despacha_Id = u_despacha.Usuario_Id
                LEFT JOIN Bodegas bo ON r.Origen_Bodega_Id = bo.Bodega_Id
                LEFT JOIN Bodegas bd ON r.Destino_Bodega_Id = bd.Bodega_Id
                WHERE r.Requerimiento_Id = ?
            `, [requerimientoId]);

            if (requerimientoRows.length === 0) {
                return null;
            }

            const requerimiento = requerimientoRows[0];

            // Verificar permisos del usuario
            const permisos = await this.verificarPermisos(connection, usuarioId, requerimiento);
            
            // Si no puede ver el requerimiento, no devolver datos
            if (!permisos.puede_ver) {
                throw new Error('No tienes permisos para ver este requerimiento');
            }

            // Obtener detalle del requerimiento solo si tiene permisos
            const [detalleRows] = await connection.execute(`
                SELECT 
                    rd.*,
                    i.Item_Nombre,
                    i.Item_Codigo_SKU as Item_Codigo,
                    i.Item_Nombre as Item_Descripcion,
                    i.Item_Codigo_Barra,
                    c.CategoriaItem_Nombre,
                    um.UnidadMedida_Nombre,
                    um.UnidadMedida_Prefijo,
                    ip.Presentacion_Nombre,
                    ip.Cantidad_Base,
                    (rd.Cantidad_Solicitada - rd.Cantidad_Despachada) as Cantidad_Pendiente
                FROM Requerimientos_Detalle rd
                INNER JOIN Items i ON rd.Item_Id = i.Item_Id
                LEFT JOIN CategoriasItems c ON i.CategoriaItem_Id = c.CategoriaItem_Id
                LEFT JOIN UnidadesMedida um ON i.UnidadMedidaBase_Id = um.UnidadMedida_Id
                LEFT JOIN Items_Presentaciones ip ON rd.Item_Presentaciones_Id = ip.Item_Presentaciones_Id
                WHERE rd.Requerimiento_Id = ?
                ORDER BY i.Item_Nombre
            `, [requerimientoId]);

            requerimiento.detalle = detalleRows;

            // Determinar acciones disponibles basadas en permisos y estado
            const acciones = this.determinarAccionesDisponibles(permisos, requerimiento);

            return {
                requerimiento: requerimiento,
                permisos_usuario: permisos,
                acciones_disponibles: acciones
            };

        } finally {
            connection.release();
        }
    }

    /**
     * Verificar permisos del usuario sobre un requerimiento específico
     */
    static async verificarPermisos(connection, usuarioId, requerimiento) {
        // Verificar si es el propietario
        const esPropietario = requerimiento.Usuario_Solicita_Id === usuarioId;

        // Verificar permisos del sistema
        const [permisosTodos] = await connection.execute(
            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
            [usuarioId, 'requerimientos.ver_todos']
        );

        const [permisosAprobar] = await connection.execute(
            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
            [usuarioId, 'requerimientos.aprobar']
        );

        const [permisosDespachar] = await connection.execute(
            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
            [usuarioId, 'requerimientos.despachar']
        );

        const [permisosCancelarOtros] = await connection.execute(
            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
            [usuarioId, 'requerimientos.cancelar_otros']
        );

        const [permisosReportes] = await connection.execute(
            'SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso',
            [usuarioId, 'requerimientos.reportes']
        );

        const tieneVerTodos = permisosTodos[0].tiene_permiso;
        const puedeAprobar = permisosAprobar[0].tiene_permiso;
        const puedeDespachar = permisosDespachar[0].tiene_permiso;
        const puedeCancelarOtros = permisosCancelarOtros[0].tiene_permiso;
        const puedeVerReportes = permisosReportes[0].tiene_permiso;

        // Lógica de permisos contextuales
        let puedeVer = false;
        let puedeEditar = false;
        let puedeCancelar = false;
        let puedeAprobarEste = false;
        let puedeDespacharEste = false;

        // Puede ver si:
        if (esPropietario) {
            puedeVer = true;
            puedeEditar = requerimiento.Estado === 'Pendiente'; // Solo editar si está pendiente
            puedeCancelar = ['Pendiente', 'Aprobado'].includes(requerimiento.Estado);
        } else if (tieneVerTodos || puedeVerReportes) {
            puedeVer = true;
        } else if (puedeAprobar && requerimiento.Estado === 'Pendiente') {
            puedeVer = true;
            puedeAprobarEste = true;
        } else if (puedeDespachar && ['Aprobado', 'En_Despacho', 'Parcialmente_Despachado'].includes(requerimiento.Estado)) {
            puedeVer = true;
            puedeDespacharEste = true;
        }

        // Permisos adicionales para administradores
        if (tieneVerTodos) {
            puedeAprobarEste = puedeAprobar && requerimiento.Estado === 'Pendiente';
            puedeDespacharEste = puedeDespachar && ['Aprobado', 'En_Despacho', 'Parcialmente_Despachado'].includes(requerimiento.Estado);
            puedeCancelar = puedeCancelarOtros && ['Pendiente', 'Aprobado'].includes(requerimiento.Estado);
        }

        return {
            puede_ver: puedeVer,
            es_propietario: esPropietario,
            puede_editar: puedeEditar,
            puede_cancelar: puedeCancelar,
            puede_aprobar: puedeAprobarEste,
            puede_despachar: puedeDespacharEste,
            puede_ver_todos: tieneVerTodos,
            puede_ver_reportes: puedeVerReportes,
            contexto_acceso: esPropietario ? 'propietario' : 
                           tieneVerTodos ? 'administrador' :
                           puedeAprobarEste ? 'aprobador' :
                           puedeDespacharEste ? 'despachador' : 'limitado'
        };
    }

    /**
     * Determinar acciones disponibles según permisos y estado
     */
    static determinarAccionesDisponibles(permisos, requerimiento) {
        const acciones = [];

        // Acciones siempre disponibles si puede ver
        if (permisos.puede_ver) {
            acciones.push('ver_detalle');
        }

        // Acciones según permisos específicos
        if (permisos.puede_editar) {
            acciones.push('editar');
        }

        if (permisos.puede_cancelar) {
            acciones.push('cancelar');
        }

        if (permisos.puede_aprobar) {
            acciones.push('aprobar', 'rechazar');
        }

        if (permisos.puede_despachar) {
            acciones.push('despachar');
        }

        // Acciones de visualización adicionales
        if (permisos.puede_ver_reportes || permisos.puede_ver_todos) {
            acciones.push('exportar', 'imprimir');
        }

        return acciones;
    }

    // =======================================
    // CREACIÓN DE REQUERIMIENTOS
    // =======================================

    /**
     * Crear un nuevo requerimiento
     */
    static async crear(requerimientoData, items) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Validar que las bodegas existen y son diferentes
            const [bodegasRows] = await connection.execute(
                'SELECT Bodega_Id FROM Bodegas WHERE Bodega_Id IN (?, ?)',
                [requerimientoData.Origen_Bodega_Id, requerimientoData.Destino_Bodega_Id]
            );

            if (bodegasRows.length !== 2) {
                throw new Error('Una o ambas bodegas no existen');
            }

            if (requerimientoData.Origen_Bodega_Id === requerimientoData.Destino_Bodega_Id) {
                throw new Error('Las bodegas origen y destino deben ser diferentes');
            }

            // Crear el requerimiento principal
            const [result] = await connection.execute(`
                INSERT INTO Requerimientos (
                    Usuario_Solicita_Id, 
                    Origen_Bodega_Id, 
                    Destino_Bodega_Id, 
                    Estado, 
                    Observaciones,
                    Fecha
                ) VALUES (?, ?, ?, 'Pendiente', ?, NOW())
            `, [
                requerimientoData.Usuario_Solicita_Id,
                requerimientoData.Origen_Bodega_Id,
                requerimientoData.Destino_Bodega_Id,
                requerimientoData.Observaciones || null
            ]);

            const requerimientoId = result.insertId;

            // Agregar items al detalle
            for (const item of items) {
                // Validar que el item existe
                const [itemExists] = await connection.execute(
                    'SELECT Item_Id FROM Items WHERE Item_Id = ?',
                    [item.Item_Id]
                );

                if (itemExists.length === 0) {
                    throw new Error(`Item ${item.Item_Id} no existe`);
                }

                // Calcular cantidades
                const calculos = await this.calcularCantidadItem(connection, item);

                await connection.execute(`
                    INSERT INTO Requerimientos_Detalle (
                        Requerimiento_Id,
                        Item_Id,
                        Item_Presentaciones_Id,
                        Cantidad_Solicitada,
                        Cantidad_Solicitada_Presentacion,
                        Cantidad_Despachada,
                        Es_Requerimiento_Por_Presentacion
                    ) VALUES (?, ?, ?, ?, ?, 0, ?)
                `, [
                    requerimientoId,
                    item.Item_Id,
                    item.Item_Presentaciones_Id || null,
                    calculos.cantidadBase,
                    calculos.cantidadPresentacion || null,
                    calculos.esPorPresentacion
                ]);

                console.log(`✅ Item ${item.Item_Id} agregado al requerimiento ${requerimientoId}:`, {
                    Cantidad_Solicitada: calculos.cantidadBase,
                    Es_Por_Presentacion: calculos.esPorPresentacion,
                    Item_Presentaciones_Id: item.Item_Presentaciones_Id
                });
            }

            await connection.commit();
            console.log(`🎯 Requerimiento ${requerimientoId} creado exitosamente`);

            return requerimientoId;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // APROBACIÓN Y RECHAZO
    // =======================================

    /**
     * Aprobar un requerimiento
     */
    static async aprobar(requerimientoId, usuarioApruebaId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que el requerimiento existe y está pendiente
            const [requerimientoRows] = await connection.execute(
                'SELECT Estado FROM Requerimientos WHERE Requerimiento_Id = ?',
                [requerimientoId]
            );

            if (requerimientoRows.length === 0) {
                throw new Error('Requerimiento no encontrado');
            }

            if (requerimientoRows[0].Estado !== 'Pendiente') {
                throw new Error('Solo se pueden aprobar requerimientos pendientes');
            }

            // Actualizar estado y datos de aprobación
            await connection.execute(`
                UPDATE Requerimientos 
                SET Estado = 'Aprobado', 
                    Usuario_Aprueba_Id = ?, 
                    Fecha_Aprobacion = NOW()
                WHERE Requerimiento_Id = ?
            `, [usuarioApruebaId, requerimientoId]);

            await connection.commit();
            
            console.log(`✅ Requerimiento ${requerimientoId} aprobado exitosamente`);
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Rechazar un requerimiento
     */
    static async rechazar(requerimientoId, usuarioApruebaId, observaciones) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que el requerimiento existe y está pendiente
            const [requerimientoRows] = await connection.execute(
                'SELECT Estado FROM Requerimientos WHERE Requerimiento_Id = ?',
                [requerimientoId]
            );

            if (requerimientoRows.length === 0) {
                throw new Error('Requerimiento no encontrado');
            }

            if (requerimientoRows[0].Estado !== 'Pendiente') {
                throw new Error('Solo se pueden rechazar Requerimientos pendientes');
            }

            // Actualizar estado y datos de rechazo
            await connection.execute(`
                UPDATE Requerimientos 
                SET Estado = 'Rechazado', 
                    Usuario_Aprueba_Id = ?, 
                    Fecha_Aprobacion = NOW(),
                    Observaciones_Despacho = ?
                WHERE Requerimiento_Id = ?
            `, [usuarioApruebaId, observaciones || null, requerimientoId]);

            await connection.commit();
            
            console.log(`❌ Requerimiento ${requerimientoId} rechazado`);
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // VALIDACIONES PARA DESPACHO
    // =======================================

    /**
     * Validar que hay stock suficiente para el despacho antes de ejecutarlo
     * @param {object} connection - Conexión a la base de datos
     * @param {number} requerimientoId - ID del requerimiento
     * @param {array} itemsDespacho - Items a despachar con cantidades
     * @returns {object} - Información de validación y items procesados
     */
    static async validarStockParaDespacho(connection, requerimientoId, itemsDespacho) {
        console.log(`🔍 Validando stock para despacho del requerimiento ${requerimientoId}...`);

        // Obtener información del requerimiento y su detalle
        const [requerimientoRows] = await connection.execute(
            'SELECT Origen_Bodega_Id, Destino_Bodega_Id FROM Requerimientos WHERE Requerimiento_Id = ?',
            [requerimientoId]
        );

        if (requerimientoRows.length === 0) {
            throw new Error('Requerimiento no encontrado');
        }

        const requerimiento = requerimientoRows[0];

        // Obtener detalle actual del requerimiento
        const [detalleActual] = await connection.execute(`
            SELECT 
                rd.*,
                i.Item_Nombre,
                (rd.Cantidad_Solicitada - rd.Cantidad_Despachada) as Cantidad_Pendiente
            FROM Requerimientos_Detalle rd
            INNER JOIN Items i ON rd.Item_Id = i.Item_Id
            WHERE rd.Requerimiento_Id = ?
        `, [requerimientoId]);

        const erroresStock = [];
        const itemsValidados = [];

        // Procesar cada item del despacho
        for (const itemDespacho of itemsDespacho) {
            const detalleItem = detalleActual.find(d => d.Item_Id === itemDespacho.Item_Id);
            
            if (!detalleItem) {
                throw new Error(`Item ${itemDespacho.Item_Id} no encontrado en el requerimiento`);
            }

            let cantidadADespachar = itemDespacho.Cantidad_Despachada || 0;

            // Si es por presentación, calcular cantidad base
            if (detalleItem.Es_Requerimiento_Por_Presentacion && itemDespacho.Cantidad_Despachada_Presentacion) {
                const [presentacionRows] = await connection.execute(
                    'SELECT Cantidad_Base FROM Items_Presentaciones WHERE Item_Presentaciones_Id = ?',
                    [detalleItem.Item_Presentaciones_Id]
                );
                
                if (presentacionRows.length > 0) {
                    const cantidadBase = presentacionRows[0].Cantidad_Base;
                    cantidadADespachar = itemDespacho.Cantidad_Despachada_Presentacion * cantidadBase;
                }
            }

            // Solo validar items que se van a despachar
            if (cantidadADespachar > 0) {
                // Validar que no exceda la cantidad pendiente
                if (cantidadADespachar > detalleItem.Cantidad_Pendiente) {
                    throw new Error(`Cantidad a despachar (${cantidadADespachar}) excede la cantidad pendiente (${detalleItem.Cantidad_Pendiente}) para el item ${detalleItem.Item_Nombre}`);
                }

                // Validar stock disponible en bodega origen
                const [stockRows] = await connection.execute(
                    'SELECT IFNULL(Cantidad, 0) as Stock_Actual FROM Existencias WHERE Bodega_Id = ? AND Item_Id = ?',
                    [requerimiento.Origen_Bodega_Id, itemDespacho.Item_Id]
                );

                const stockActual = stockRows.length > 0 ? stockRows[0].Stock_Actual : 0;
                
                if (stockActual < cantidadADespachar) {
                    erroresStock.push({
                        itemId: itemDespacho.Item_Id,
                        itemNombre: detalleItem.Item_Nombre,
                        stockActual,
                        cantidadSolicitada: cantidadADespachar,
                        cantidadPendiente: detalleItem.Cantidad_Pendiente
                    });
                }

                // Agregar a items validados
                itemsValidados.push({
                    ...itemDespacho,
                    cantidadCalculada: cantidadADespachar,
                    itemNombre: detalleItem.Item_Nombre,
                    stockDisponible: stockActual
                });
            }
        }

        // Si hay errores de stock, generar error detallado
        if (erroresStock.length > 0) {
            const detalleErrores = erroresStock.map(e => 
                `${e.itemNombre}: Stock ${e.stockActual}, Solicitado ${e.cantidadSolicitada}`
            ).join('; ');
            
            throw new Error(`Stock insuficiente en bodega origen para completar el despacho. Detalles: ${detalleErrores}`);
        }

        console.log(`✅ Validación de stock completada exitosamente. Items a despachar: ${itemsValidados.length}`);

        return {
            requerimiento,
            itemsValidados,
            stockValidado: true
        };
    }

    // =======================================
    // DESPACHO - FUNCIÓN PRINCIPAL CORREGIDA
    // =======================================

    /**
     * Despachar requerimiento (total o parcialmente)
     * CORRECCIÓN: Maneja la coordinación con el trigger automático de la BD
     */
    static async despachar(requerimientoId, usuarioDespachaId, itemsDespacho, observacionesDespacho) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            console.log(`🚚 Iniciando despacho del requerimiento ${requerimientoId}...`);
            console.log(`👤 Usuario que despacha: ${usuarioDespachaId}`);
            console.log(`📝 Observaciones: ${observacionesDespacho}`);

            // =========================================================
            // PASO 0: VALIDACIÓN PREVIA DE STOCK (SIN MODIFICAR DATOS)
            // =========================================================
            console.log(`🔒 Validando stock antes de proceder con el despacho...`);
            const validacionStock = await this.validarStockParaDespacho(connection, requerimientoId, itemsDespacho);
            console.log(`✅ Stock validado exitosamente. Procediendo con el despacho...`);

            // Verificar que el requerimiento existe y puede ser despachado
            const [requerimientoRows] = await connection.execute(
                'SELECT * FROM Requerimientos WHERE Requerimiento_Id = ?',
                [requerimientoId]
            );

            if (requerimientoRows.length === 0) {
                throw new Error('Requerimiento no encontrado');
            }

            const requerimiento = requerimientoRows[0];
            
            if (!['Aprobado', 'En_Despacho', 'Parcialmente_Despachado'].includes(requerimiento.Estado)) {
                throw new Error('Solo se pueden despachar requerimientos aprobados o en despacho');
            }

            // PASO 1: ACTUALIZAR PRIMERO LOS CAMPOS DE DESPACHO PARA EL TRIGGER
            console.log(`🔧 Actualizando campos de despacho antes de procesar items...`);
            await connection.execute(`
                UPDATE Requerimientos 
                SET Usuario_Despacha_Id = ?, 
                    Fecha_Despacho = NOW(),
                    Observaciones_Despacho = ?
                WHERE Requerimiento_Id = ?
            `, [usuarioDespachaId, observacionesDespacho, requerimientoId]);

            // Obtener detalle actual del requerimiento
            const [detalleActual] = await connection.execute(`
                SELECT 
                    rd.*,
                    (rd.Cantidad_Solicitada - rd.Cantidad_Despachada) as Cantidad_Pendiente
                FROM Requerimientos_Detalle rd
                WHERE rd.Requerimiento_Id = ?
            `, [requerimientoId]);

            console.log(`📋 Detalle actual del requerimiento:`, detalleActual);

            let hayAlgunDespacho = false;
            let itemsParaTransferencia = [];

            console.log(`🔍 Procesando ${itemsDespacho.length} items para despacho:`, itemsDespacho);
            
            // PASO 2: Procesar cada item del despacho
            for (const itemDespacho of itemsDespacho) {
                console.log(`🔍 Procesando item despacho:`, itemDespacho);
                
                const detalleItem = detalleActual.find(d => d.Item_Id === itemDespacho.Item_Id);
                
                if (!detalleItem) {
                    throw new Error(`Item ${itemDespacho.Item_Id} no encontrado en el requerimiento`);
                }

                console.log(`🔍 Detalle del item encontrado:`, detalleItem);

                let cantidadADespachar = itemDespacho.Cantidad_Despachada || 0;
                let cantidadDespachadaPresentacion = null;

                console.log(`🔍 Cantidad inicial a despachar:`, cantidadADespachar);

                // Si es por presentación, calcular cantidad base
                if (detalleItem.Es_Requerimiento_Por_Presentacion && itemDespacho.Cantidad_Despachada_Presentacion) {
                    const [presentacionRows] = await connection.execute(
                        'SELECT Cantidad_Base FROM Items_Presentaciones WHERE Item_Presentaciones_Id = ?',
                        [detalleItem.Item_Presentaciones_Id]
                    );
                    
                    if (presentacionRows.length > 0) {
                        const cantidadBase = presentacionRows[0].Cantidad_Base;
                        cantidadADespachar = itemDespacho.Cantidad_Despachada_Presentacion * cantidadBase;
                        cantidadDespachadaPresentacion = itemDespacho.Cantidad_Despachada_Presentacion;
                        console.log(`🧮 Calculado por presentación: ${cantidadADespachar} unidades`);
                    }
                }

                console.log(`🔍 Cantidad final a despachar:`, cantidadADespachar);

                if (cantidadADespachar <= 0) {
                    console.log(`⚠️ Saltando item ${itemDespacho.Item_Id} porque cantidad es 0 o negativa`);
                    continue;
                }

                // Validar que no exceda la cantidad pendiente
                if (cantidadADespachar > detalleItem.Cantidad_Pendiente) {
                    throw new Error(`Cantidad a despachar (${cantidadADespachar}) excede la cantidad pendiente (${detalleItem.Cantidad_Pendiente}) para el item ${itemDespacho.Item_Id}`);
                }

                // Actualizar cantidad despachada en el detalle del requerimiento
                // CORRECCIÓN: Convertir a número para evitar concatenación de strings
                const cantidadDespachadaActual = parseFloat(detalleItem.Cantidad_Despachada) || 0;
                const nuevaCantidadDespachada = cantidadDespachadaActual + cantidadADespachar;
                
                console.log(`🔄 Actualizando detalle: ${cantidadDespachadaActual} + ${cantidadADespachar} = ${nuevaCantidadDespachada}`);
                
                // PASO 3: ACTUALIZAR EL DETALLE (esto dispara el trigger)
                await connection.execute(`
                    UPDATE Requerimientos_Detalle
                    SET Cantidad_Despachada = ?,
                        Cantidad_Despachada_Presentacion = ?
                    WHERE Requerimiento_Detalle_Id = ?
                `, [
                    nuevaCantidadDespachada,
                    cantidadDespachadaPresentacion ? (parseFloat(detalleItem.Cantidad_Despachada_Presentacion) || 0) + cantidadDespachadaPresentacion : detalleItem.Cantidad_Despachada_Presentacion,
                    detalleItem.Requerimiento_Detalle_Id
                ]);

                if (cantidadADespachar > 0) {
                    hayAlgunDespacho = true;
                    
                    // Preparar item para transferencia (FORMATO CORRECTO PARA MOVIMIENTOS)
                    itemsParaTransferencia.push({
                        Item_Id: itemDespacho.Item_Id,
                        Cantidad: cantidadADespachar, // Movimientos usa 'Cantidad', no 'Cantidad_Despachada'
                        Item_Presentaciones_Id: detalleItem.Item_Presentaciones_Id || null,
                        Cantidad_Presentacion: cantidadDespachadaPresentacion || null, // Movimientos usa 'Cantidad_Presentacion'
                        Es_Movimiento_Por_Presentacion: detalleItem.Es_Requerimiento_Por_Presentacion || false // Convertir a booleano
                    });
                }

                console.log(`📦 Item ${itemDespacho.Item_Id} despachado: ${cantidadADespachar} unidades`);
            }

            // VERIFICACIÓN CORRECTA: Revisar si TODOS los items del requerimiento quedaron completamente despachados
            console.log(`🔍 Verificando si el requerimiento está completamente despachado...`);
            
            // Obtener estado actual de TODOS los items después de las actualizaciones
            const [detalleActualizado] = await connection.execute(`
                SELECT 
                    Item_Id,
                    Cantidad_Solicitada,
                    Cantidad_Despachada,
                    (Cantidad_Solicitada - Cantidad_Despachada) as Cantidad_Pendiente
                FROM Requerimientos_Detalle
                WHERE Requerimiento_Id = ?
            `, [requerimientoId]);

            // Verificar si algún item aún tiene cantidad pendiente
            const itemsPendientes = detalleActualizado.filter(item => parseFloat(item.Cantidad_Pendiente) > 0);
            const hayDespachoTotal = itemsPendientes.length === 0;
            
            console.log(`📊 Resumen del despacho:`, {
                totalItems: detalleActualizado.length,
                itemsPendientes: itemsPendientes.length,
                hayDespachoTotal,
                itemsConPendientes: itemsPendientes.map(item => ({ 
                    Item_Id: item.Item_Id, 
                    Pendiente: parseFloat(item.Cantidad_Pendiente)
                }))
            });

            // PASO 4: Crear movimiento de transferencia si hay items para despachar
            let movimientoId = null;
            let errorMovimiento = null;
            
            console.log(`🔍 Items para transferencia preparados:`, itemsParaTransferencia);
            
            if (itemsParaTransferencia.length > 0) {
                try {
                    // Importar el modelo de movimientos para crear la transferencia
                    const MovimientoModel = require('../movimientos/movimiento.model');
                    
                    // Preparar datos del movimiento
                    const movimientoData = {
                        Usuario_Id: usuarioDespachaId,
                        Origen_Bodega_Id: requerimiento.Origen_Bodega_Id,
                        Destino_Bodega_Id: requerimiento.Destino_Bodega_Id,
                        Recepcionista: requerimiento.Usuario_Solicita_Id, // Usuario que solicitó el requerimiento
                        Motivo: `Despacho de Requerimiento #${requerimientoId}`,
                        Observaciones: `Despacho automático de Requerimiento #${requerimientoId}. ${observacionesDespacho ? `Observaciones: ${observacionesDespacho}` : ''}`
                    };

                    console.log(`🚛 Datos del movimiento a crear:`, movimientoData);
                    console.log(`🚛 Creando transferencia automática para requerimiento ${requerimientoId}...`);
                    
                    // Crear la transferencia usando el modelo de movimientos
                    movimientoId = await MovimientoModel.crearTransferencia(movimientoData, itemsParaTransferencia);
                    
                    console.log(`✅ Transferencia ${movimientoId} creada exitosamente para requerimiento ${requerimientoId}`);
                } catch (movimientoError) {
                    // Si hay error en la creación del movimiento, lo registramos pero continuamos
                    errorMovimiento = movimientoError.message;
                    console.log(`⚠️ Error creando movimiento: ${errorMovimiento}`);
                    console.log(`📝 El requerimiento se marcará como despachado pero SIN movimiento asociado`);
                }
            } else {
                console.log(`⚠️ No hay items para transferir - no se creará movimiento`);
            }

            // PASO 5: COMMIT y obtener estado final
            await connection.commit();
            
            // Obtener el estado final actualizado por el trigger
            const [estadoFinal] = await connection.execute(
                'SELECT Estado FROM Requerimientos WHERE Requerimiento_Id = ?',
                [requerimientoId]
            );
            const estadoActualizado = estadoFinal[0]?.Estado || 'En_Despacho';

            console.log(`🚚 Requerimiento ${requerimientoId} despachado. Estado actualizado por trigger: ${estadoActualizado}${movimientoId ? `. Movimiento creado: ${movimientoId}` : ''}${errorMovimiento ? `. Error en movimiento: ${errorMovimiento}` : ''}`);
            
            return { 
                requerimientoId, 
                nuevoEstado: estadoActualizado, // Estado real actualizado por el trigger
                movimientoId: movimientoId,
                itemsDespachados: itemsParaTransferencia.length,
                errorMovimiento: errorMovimiento
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // CANCELACIÓN
    // =======================================

    /**
     * Cancelar un requerimiento
     */
    static async cancelar(requerimientoId, usuarioId, observaciones) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // Verificar que el requerimiento puede ser cancelado
            const [requerimientoRows] = await connection.execute(
                'SELECT Estado FROM Requerimientos WHERE Requerimiento_Id = ?',
                [requerimientoId]
            );

            if (requerimientoRows.length === 0) {
                throw new Error('Requerimiento no encontrado');
            }

            if (!['Pendiente', 'Aprobado'].includes(requerimientoRows[0].Estado)) {
                throw new Error('Solo se pueden cancelar requerimientos pendientes o aprobados');
            }

            // Cancelar el requerimiento
            await connection.execute(`
                UPDATE Requerimientos 
                SET Estado = 'Cancelado',
                    Observaciones_Despacho = ?
                WHERE Requerimiento_Id = ?
            `, [observaciones || null, requerimientoId]);

            await connection.commit();
            
            console.log(`🚫 Requerimiento ${requerimientoId} cancelado`);
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // =======================================
    // CONSULTAS ESPECIALIZADAS
    // =======================================

    /**
     * Obtener estadísticas generales de requerimientos
     */
    static async getEstadisticas() {
        const connection = await db.getConnection();
        
        try {
            const [stats] = await connection.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN Estado = 'Aprobado' THEN 1 ELSE 0 END) as aprobados,
                    SUM(CASE WHEN Estado = 'En_Despacho' THEN 1 ELSE 0 END) as en_despacho,
                    SUM(CASE WHEN Estado = 'Completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN Estado = 'Parcialmente_Despachado' THEN 1 ELSE 0 END) as parciales,
                    SUM(CASE WHEN Estado = 'Rechazado' THEN 1 ELSE 0 END) as rechazados,
                    SUM(CASE WHEN Estado = 'Cancelado' THEN 1 ELSE 0 END) as cancelados
                FROM Requerimientos
            `);

            return stats[0];

        } finally {
            connection.release();
        }
    }
}

module.exports = RequerimientoModel;