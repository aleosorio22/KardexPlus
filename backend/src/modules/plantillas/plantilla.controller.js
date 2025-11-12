const PlantillaModel = require('./plantilla.model');

class PlantillaController {

    // =======================================
    // ENDPOINTS DE CONSULTA
    // =======================================

    /**
     * Obtener todas las plantillas con filtros
     * GET /api/plantillas
     */
    static async getAllPlantillas(req, res) {
        try {
            const filters = {
                tipo_plantilla: req.query.tipo_plantilla,
                subtipo_plantilla: req.query.subtipo_plantilla,
                origen_bodega_id: req.query.origen_bodega_id,
                destino_bodega_id: req.query.destino_bodega_id,
                search: req.query.search,
                ver_todas: req.query.ver_todas === 'true' // Para admins que quieren ver todas
            };

            // Si no tiene permiso ver_todas, solo mostrar sus plantillas asignadas
            const usuarioId = filters.ver_todas ? null : req.user.id;

            const plantillas = await PlantillaModel.findAll(filters, usuarioId);

            res.json({
                success: true,
                data: plantillas,
                total: plantillas.length,
                message: 'Plantillas obtenidas exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo plantillas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener plantillas asignadas al usuario autenticado
     * GET /api/plantillas/mis-plantillas
     */
    static async getMisPlantillas(req, res) {
        try {
            const filters = {
                tipo_plantilla: req.query.tipo_plantilla,
                subtipo_plantilla: req.query.subtipo_plantilla,
                search: req.query.search,
                ver_todas: false // Solo sus plantillas
            };

            const plantillas = await PlantillaModel.findAll(filters, req.user.id);

            res.json({
                success: true,
                data: plantillas,
                total: plantillas.length,
                message: 'Mis plantillas obtenidas exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo mis plantillas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener plantilla por ID con detalle completo
     * GET /api/plantillas/:plantillaId
     */
    static async getPlantillaById(req, res) {
        try {
            const { plantillaId } = req.params;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            const plantilla = await PlantillaModel.findById(parseInt(plantillaId));

            if (!plantilla) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            // Verificar acceso del usuario
            const acceso = await PlantillaModel.verificarAccesoUsuario(
                parseInt(plantillaId), 
                req.user.id
            );

            if (!acceso.tieneAcceso) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene acceso a esta plantilla'
                });
            }

            res.json({
                success: true,
                data: plantilla,
                permisos: {
                    puede_modificar: acceso.puedeModificar,
                    es_creador: acceso.esCreador
                },
                message: 'Plantilla obtenida exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo plantilla por ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener plantillas por tipo específico
     * GET /api/plantillas/tipo/:tipo
     */
    static async getPlantillasByTipo(req, res) {
        try {
            const { tipo } = req.params;

            // Validar tipo
            const tiposValidos = ['Requerimiento', 'Movimiento', 'Compra'];
            if (!tiposValidos.includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}`
                });
            }

            const filters = {
                tipo_plantilla: tipo,
                subtipo_plantilla: req.query.subtipo,
                search: req.query.search
            };

            const usuarioId = req.query.ver_todas === 'true' ? null : req.user.id;
            const plantillas = await PlantillaModel.findAll(filters, usuarioId);

            res.json({
                success: true,
                data: plantillas,
                total: plantillas.length,
                message: `Plantillas de tipo ${tipo} obtenidas exitosamente`
            });

        } catch (error) {
            console.error('Error obteniendo plantillas por tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE CREACIÓN
    // =======================================

    /**
     * Crear nueva plantilla
     * POST /api/plantillas
     */
    static async crearPlantilla(req, res) {
        try {
            const { plantilla, items, usuarios_asignados } = req.body;

            // Validaciones básicas
            if (!plantilla) {
                return res.status(400).json({
                    success: false,
                    message: 'Los datos de la plantilla son requeridos'
                });
            }

            if (!plantilla.Plantilla_Nombre || !plantilla.Plantilla_Nombre.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de la plantilla es requerido'
                });
            }

            if (!plantilla.Tipo_Plantilla) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de plantilla es requerido'
                });
            }

            // Permitir crear plantillas sin items inicialmente
            // Los items se agregarán en la página de detalles
            // if (!Array.isArray(items) || items.length === 0) {
            //     return res.status(400).json({
            //         success: false,
            //         message: 'Debe especificar al menos un item'
            //     });
            // }

            // Validar items (si se proporcionaron)
            if (items && Array.isArray(items) && items.length > 0) {
                for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                if (!item.Item_Id || isNaN(item.Item_Id)) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i + 1}: ID de item inválido`
                    });
                }

                if (!item.Cantidad || isNaN(item.Cantidad) || parseFloat(item.Cantidad) <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i + 1}: Cantidad debe ser un número positivo`
                    });
                }

                // Si es por presentación, validar campos adicionales
                if (item.Es_Por_Presentacion) {
                    if (!item.Item_Presentaciones_Id) {
                        return res.status(400).json({
                            success: false,
                            message: `Item en posición ${i + 1}: ID de presentación es requerido`
                        });
                    }

                    if (!item.Cantidad_Presentacion || parseFloat(item.Cantidad_Presentacion) <= 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Item en posición ${i + 1}: Cantidad de presentación debe ser mayor a 0`
                        });
                    }
                }
            }
            } // Cerrar if (items && Array.isArray(items) && items.length > 0)

            // Agregar el usuario creador
            plantilla.Usuario_Creador_Id = req.user.id;

            const plantillaId = await PlantillaModel.crear(
                plantilla, 
                items, 
                usuarios_asignados || []
            );

            res.status(201).json({
                success: true,
                data: { plantilla_id: plantillaId },
                message: 'Plantilla creada exitosamente'
            });

        } catch (error) {
            console.error('Error creando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE EDICIÓN
    // =======================================

    /**
     * Actualizar datos principales de una plantilla
     * PUT /api/plantillas/:plantillaId
     */
    static async actualizarPlantilla(req, res) {
        try {
            const { plantillaId } = req.params;
            const plantillaData = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            // Verificar que la plantilla existe y el usuario tiene permisos
            const acceso = await PlantillaModel.verificarAccesoUsuario(
                parseInt(plantillaId), 
                req.user.id
            );

            if (!acceso.tieneAcceso) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            if (!acceso.puedeModificar) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para modificar esta plantilla'
                });
            }

            await PlantillaModel.actualizar(parseInt(plantillaId), plantillaData);

            res.json({
                success: true,
                message: 'Plantilla actualizada exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar items de una plantilla
     * PUT /api/plantillas/:plantillaId/items
     */
    static async actualizarItemsPlantilla(req, res) {
        try {
            const { plantillaId } = req.params;
            const { items } = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un item'
                });
            }

            // Verificar permisos
            const acceso = await PlantillaModel.verificarAccesoUsuario(
                parseInt(plantillaId), 
                req.user.id
            );

            if (!acceso.tieneAcceso) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            if (!acceso.puedeModificar) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para modificar esta plantilla'
                });
            }

            // Validar items
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                if (!item.Item_Id || isNaN(item.Item_Id)) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i + 1}: ID de item inválido`
                    });
                }

                if (!item.Cantidad || isNaN(item.Cantidad) || parseFloat(item.Cantidad) <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Item en posición ${i + 1}: Cantidad debe ser un número positivo`
                    });
                }
            }

            await PlantillaModel.actualizarItems(parseInt(plantillaId), items);

            res.json({
                success: true,
                message: 'Items de plantilla actualizados exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando items de plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE GESTIÓN DE USUARIOS
    // =======================================

    /**
     * Asignar usuarios a una plantilla
     * POST /api/plantillas/:plantillaId/asignar-usuarios
     */
    static async asignarUsuarios(req, res) {
        try {
            const { plantillaId } = req.params;
            const { usuarios_ids } = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            if (!usuarios_ids || !Array.isArray(usuarios_ids) || usuarios_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un usuario'
                });
            }

            // Validar que todos los IDs sean números
            const idsInvalidos = usuarios_ids.filter(id => isNaN(id));
            if (idsInvalidos.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más IDs de usuario son inválidos'
                });
            }

            await PlantillaModel.asignarUsuarios(
                parseInt(plantillaId), 
                usuarios_ids.map(id => parseInt(id)),
                req.user.id
            );

            res.json({
                success: true,
                message: `${usuarios_ids.length} usuario(s) asignado(s) exitosamente`
            });

        } catch (error) {
            console.error('Error asignando usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Desasignar usuarios de una plantilla
     * POST /api/plantillas/:plantillaId/desasignar-usuarios
     */
    static async desasignarUsuarios(req, res) {
        try {
            const { plantillaId } = req.params;
            const { usuarios_ids } = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            if (!usuarios_ids || !Array.isArray(usuarios_ids) || usuarios_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe especificar al menos un usuario'
                });
            }

            await PlantillaModel.desasignarUsuarios(
                parseInt(plantillaId),
                usuarios_ids.map(id => parseInt(id))
            );

            res.json({
                success: true,
                message: `${usuarios_ids.length} usuario(s) desasignado(s) exitosamente`
            });

        } catch (error) {
            console.error('Error desasignando usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar permisos de un usuario sobre una plantilla
     * PUT /api/plantillas/:plantillaId/usuarios/:usuarioId/permisos
     */
    static async actualizarPermisosUsuario(req, res) {
        try {
            const { plantillaId, usuarioId } = req.params;
            const { puede_modificar } = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            if (!usuarioId || isNaN(usuarioId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            if (puede_modificar === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo puede_modificar es requerido'
                });
            }

            await PlantillaModel.actualizarPermisosUsuario(
                parseInt(plantillaId),
                parseInt(usuarioId),
                Boolean(puede_modificar)
            );

            res.json({
                success: true,
                message: 'Permisos de usuario actualizados exitosamente'
            });

        } catch (error) {
            console.error('Error actualizando permisos de usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener usuarios asignados a una plantilla
     * GET /api/plantillas/:plantillaId/usuarios
     */
    static async getUsuariosAsignados(req, res) {
        try {
            const { plantillaId } = req.params;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            const plantilla = await PlantillaModel.findById(parseInt(plantillaId));

            if (!plantilla) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            res.json({
                success: true,
                data: plantilla.usuarios_asignados || [],
                total: plantilla.usuarios_asignados?.length || 0,
                message: 'Usuarios asignados obtenidos exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo usuarios asignados:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE ELIMINACIÓN
    // =======================================

    /**
     * Eliminar (desactivar) una plantilla
     * DELETE /api/plantillas/:plantillaId
     */
    static async eliminarPlantilla(req, res) {
        try {
            const { plantillaId } = req.params;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            // Verificar que la plantilla existe
            const plantilla = await PlantillaModel.findById(parseInt(plantillaId));

            if (!plantilla) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            await PlantillaModel.eliminar(parseInt(plantillaId));

            res.json({
                success: true,
                message: 'Plantilla eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS DE ESTADÍSTICAS
    // =======================================

    /**
     * Obtener estadísticas generales de plantillas
     * GET /api/plantillas/estadisticas
     */
    static async getEstadisticas(req, res) {
        try {
            const estadisticas = await PlantillaModel.getEstadisticas();

            res.json({
                success: true,
                data: estadisticas,
                message: 'Estadísticas obtenidas exitosamente'
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    // =======================================
    // ENDPOINTS ESPECIALIZADOS
    // =======================================

    /**
     * Validar datos antes de crear plantilla
     * POST /api/plantillas/validar
     */
    static async validarCreacion(req, res) {
        try {
            const { plantilla, items } = req.body;

            const errores = [];

            // Validar plantilla
            if (!plantilla) {
                errores.push('Los datos de la plantilla son requeridos');
            } else {
                if (!plantilla.Plantilla_Nombre || !plantilla.Plantilla_Nombre.trim()) {
                    errores.push('El nombre de la plantilla es requerido');
                }

                if (!plantilla.Tipo_Plantilla) {
                    errores.push('El tipo de plantilla es requerido');
                }

                const tiposValidos = ['Requerimiento', 'Movimiento', 'Compra'];
                if (plantilla.Tipo_Plantilla && !tiposValidos.includes(plantilla.Tipo_Plantilla)) {
                    errores.push(`Tipo de plantilla inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
                }
            }

            // Validar items
            if (!items || !Array.isArray(items)) {
                errores.push('Los items deben ser un array');
            } else if (items.length === 0) {
                errores.push('Debe especificar al menos un item');
            } else {
                items.forEach((item, index) => {
                    if (!item.Item_Id) {
                        errores.push(`Item ${index + 1}: ID de item es requerido`);
                    }
                    if (!item.Cantidad || parseFloat(item.Cantidad) <= 0) {
                        errores.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
                    }
                });
            }

            if (errores.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errores
                });
            }

            res.json({
                success: true,
                message: 'Validación exitosa',
                data: {
                    total_items: items.length,
                    tipo_plantilla: plantilla.Tipo_Plantilla
                }
            });

        } catch (error) {
            console.error('Error validando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Duplicar una plantilla existente
     * POST /api/plantillas/:plantillaId/duplicar
     */
    static async duplicarPlantilla(req, res) {
        try {
            const { plantillaId } = req.params;
            const { nuevo_nombre } = req.body;

            if (!plantillaId || isNaN(plantillaId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de plantilla inválido'
                });
            }

            // Obtener plantilla original
            const plantillaOriginal = await PlantillaModel.findById(parseInt(plantillaId));

            if (!plantillaOriginal) {
                return res.status(404).json({
                    success: false,
                    message: 'Plantilla no encontrada'
                });
            }

            // Verificar acceso
            const acceso = await PlantillaModel.verificarAccesoUsuario(
                parseInt(plantillaId), 
                req.user.id
            );

            if (!acceso.tieneAcceso) {
                return res.status(403).json({
                    success: false,
                    message: 'No tiene acceso a esta plantilla'
                });
            }

            // Preparar datos para nueva plantilla
            const nuevaPlantilla = {
                Plantilla_Nombre: nuevo_nombre || `${plantillaOriginal.Plantilla_Nombre} (Copia)`,
                Plantilla_Descripcion: plantillaOriginal.Plantilla_Descripcion,
                Tipo_Plantilla: plantillaOriginal.Tipo_Plantilla,
                Subtipo_Plantilla: plantillaOriginal.Subtipo_Plantilla,
                Origen_Bodega_Id: plantillaOriginal.Origen_Bodega_Id,
                Destino_Bodega_Id: plantillaOriginal.Destino_Bodega_Id,
                Configuracion_Adicional: plantillaOriginal.Configuracion_Adicional ? 
                    JSON.parse(plantillaOriginal.Configuracion_Adicional) : null,
                Usuario_Creador_Id: req.user.id
            };

            // Preparar items (sin IDs de detalle)
            const itemsDuplicados = plantillaOriginal.detalle.map((item, index) => ({
                Item_Id: item.Item_Id,
                Cantidad: item.Cantidad,
                Item_Presentaciones_Id: item.Item_Presentaciones_Id,
                Cantidad_Presentacion: item.Cantidad_Presentacion,
                Es_Por_Presentacion: item.Es_Por_Presentacion,
                Orden: index
            }));

            // Crear nueva plantilla
            const nuevaPlantillaId = await PlantillaModel.crear(
                nuevaPlantilla, 
                itemsDuplicados,
                [] // Sin usuarios asignados inicialmente
            );

            res.status(201).json({
                success: true,
                data: { plantilla_id: nuevaPlantillaId },
                message: 'Plantilla duplicada exitosamente'
            });

        } catch (error) {
            console.error('Error duplicando plantilla:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = PlantillaController;
