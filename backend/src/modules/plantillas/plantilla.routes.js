const express = require('express');
const router = express.Router();
const PlantillaController = require('./plantilla.controller');
const { authMiddleware, hasPermission } = require('../../core/middlewares/auth.middleware');

// =======================================
// RUTAS DE CONSULTA DE PLANTILLAS
// =======================================

// GET /api/plantillas - Obtener todas las plantillas (con filtros)
router.get('/', 
    authMiddleware, 
    hasPermission('plantillas.ver'), 
    PlantillaController.getAllPlantillas
);

// GET /api/plantillas/mis-plantillas - Obtener plantillas del usuario autenticado
router.get('/mis-plantillas', 
    authMiddleware, 
    hasPermission('plantillas.ver'), 
    PlantillaController.getMisPlantillas
);

// GET /api/plantillas/estadisticas - Obtener estadísticas generales
router.get('/estadisticas', 
    authMiddleware, 
    hasPermission('plantillas.reportes'), 
    PlantillaController.getEstadisticas
);

// GET /api/plantillas/tipo/:tipo - Obtener plantillas por tipo específico
router.get('/tipo/:tipo', 
    authMiddleware, 
    hasPermission('plantillas.ver'), 
    PlantillaController.getPlantillasByTipo
);

// GET /api/plantillas/:plantillaId - Obtener plantilla por ID con detalle completo
router.get('/:plantillaId', 
    authMiddleware, 
    hasPermission('plantillas.ver'), 
    PlantillaController.getPlantillaById
);

// GET /api/plantillas/:plantillaId/usuarios - Obtener usuarios asignados a una plantilla
router.get('/:plantillaId/usuarios', 
    authMiddleware, 
    hasPermission('plantillas.ver'), 
    PlantillaController.getUsuariosAsignados
);

// =======================================
// RUTAS DE CREACIÓN DE PLANTILLAS
// =======================================

// POST /api/plantillas - Crear nueva plantilla
router.post('/', 
    authMiddleware, 
    hasPermission('plantillas.crear'), 
    PlantillaController.crearPlantilla
);

// POST /api/plantillas/validar - Validar datos antes de crear plantilla
router.post('/validar', 
    authMiddleware, 
    hasPermission('plantillas.crear'), 
    PlantillaController.validarCreacion
);

// POST /api/plantillas/:plantillaId/duplicar - Duplicar una plantilla existente
router.post('/:plantillaId/duplicar', 
    authMiddleware, 
    hasPermission('plantillas.crear'), 
    PlantillaController.duplicarPlantilla
);

// =======================================
// RUTAS DE EDICIÓN DE PLANTILLAS
// =======================================

// PUT /api/plantillas/:plantillaId - Actualizar datos principales de una plantilla
router.put('/:plantillaId', 
    authMiddleware, 
    hasPermission('plantillas.editar'), 
    PlantillaController.actualizarPlantilla
);

// PUT /api/plantillas/:plantillaId/items - Actualizar items de una plantilla
router.put('/:plantillaId/items', 
    authMiddleware, 
    hasPermission('plantillas.editar'), 
    PlantillaController.actualizarItemsPlantilla
);

// =======================================
// RUTAS DE GESTIÓN DE USUARIOS
// =======================================

// POST /api/plantillas/:plantillaId/asignar-usuarios - Asignar usuarios a una plantilla
router.post('/:plantillaId/asignar-usuarios', 
    authMiddleware, 
    hasPermission('plantillas.asignar_usuarios'), 
    PlantillaController.asignarUsuarios
);

// POST /api/plantillas/:plantillaId/desasignar-usuarios - Desasignar usuarios de una plantilla
router.post('/:plantillaId/desasignar-usuarios', 
    authMiddleware, 
    hasPermission('plantillas.asignar_usuarios'), 
    PlantillaController.desasignarUsuarios
);

// PUT /api/plantillas/:plantillaId/usuarios/:usuarioId/permisos - Actualizar permisos de un usuario
router.put('/:plantillaId/usuarios/:usuarioId/permisos', 
    authMiddleware, 
    hasPermission('plantillas.gestionar_permisos'), 
    PlantillaController.actualizarPermisosUsuario
);

// =======================================
// RUTAS DE ELIMINACIÓN
// =======================================

// DELETE /api/plantillas/:plantillaId - Eliminar (desactivar) una plantilla
router.delete('/:plantillaId', 
    authMiddleware, 
    hasPermission('plantillas.eliminar'), 
    PlantillaController.eliminarPlantilla
);

// =======================================
// MIDDLEWARE DE VALIDACIÓN ADICIONAL
// =======================================

// Middleware para validar que las rutas de creación tengan datos válidos
const validarDatosPlantilla = (req, res, next) => {
    const { plantilla, items } = req.body;

    if (!plantilla) {
        return res.status(400).json({
            success: false,
            message: 'Los datos de la plantilla son requeridos'
        });
    }

    // Permitir crear plantillas sin items inicialmente
    // Los items se agregarán en la página de detalles
    // if (!items || !Array.isArray(items) || items.length === 0) {
    //     return res.status(400).json({
    //         success: false,
    //         message: 'Debe especificar al menos un item'
    //     });
    // }

    // Validar que cada item tenga los campos requeridos (si se proporcionaron)
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
        } // Cerrar for loop
    } // Cerrar if (items && Array.isArray(items) && items.length > 0)

    next();
};

// Middleware para validar datos de asignación de usuarios
const validarAsignacionUsuarios = (req, res, next) => {
    const { usuarios_ids } = req.body;

    if (!usuarios_ids || !Array.isArray(usuarios_ids) || usuarios_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Debe especificar al menos un usuario'
        });
    }

    // Validar que todos sean números válidos
    const idsInvalidos = usuarios_ids.filter(id => isNaN(id));
    if (idsInvalidos.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Uno o más IDs de usuario son inválidos'
        });
    }

    next();
};

// Aplicar middleware de validación a rutas específicas
router.use('/', (req, res, next) => {
    if (req.method === 'POST' && req.path === '/') {
        return validarDatosPlantilla(req, res, next);
    }
    next();
});

router.use('/:plantillaId/asignar-usuarios', validarAsignacionUsuarios);
router.use('/:plantillaId/desasignar-usuarios', validarAsignacionUsuarios);

module.exports = router;
