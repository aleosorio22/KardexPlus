const PresentacionModel = require('./presentacion.model');
const db = require('../../core/config/database');

/**
 * Obtener todas las presentaciones
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getAllPresentaciones = async (req, res) => {
    try {
        const presentaciones = await PresentacionModel.findAll();
        
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al obtener presentaciones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener presentación por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getPresentacionById = async (req, res) => {
    try {
        const presentacion = await PresentacionModel.findById(req.params.id);
        if (!presentacion) {
            return res.status(404).json({
                success: false,
                message: 'Presentación no encontrada'
            });
        }
        res.json({
            success: true,
            data: presentacion
        });
    } catch (error) {
        console.error('Error al obtener presentación:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener presentaciones por unidad de medida
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getPresentacionesByUnidadMedida = async (req, res) => {
    try {
        const presentaciones = await PresentacionModel.findByUnidadMedida(req.params.unidadMedidaId);
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al obtener presentaciones por unidad de medida:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Crear nueva presentación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.createPresentacion = async (req, res) => {
    try {
        const presentacion = await PresentacionModel.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Presentación creada exitosamente',
            data: presentacion
        });
    } catch (error) {
        console.error('Error al crear presentación:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Actualizar presentación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.updatePresentacion = async (req, res) => {
    try {
        const presentacion = await PresentacionModel.update(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Presentación actualizada exitosamente',
            data: presentacion
        });
    } catch (error) {
        console.error('Error al actualizar presentación:', error);
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Eliminar presentación
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.deletePresentacion = async (req, res) => {
    try {
        const result = await PresentacionModel.delete(req.params.id);
        res.json({
            success: true,
            message: 'Presentación eliminada exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error al eliminar presentación:', error);
        if (error.message.includes('no encontrada')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener estadísticas de presentaciones
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.getPresentacionStats = async (req, res) => {
    try {
        const stats = await PresentacionModel.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Buscar presentaciones
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
exports.searchPresentaciones = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Término de búsqueda requerido'
            });
        }
        
        const presentaciones = await PresentacionModel.search(q.trim());
        res.json({
            success: true,
            data: presentaciones
        });
    } catch (error) {
        console.error('Error al buscar presentaciones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
