// =======================================
// SERVICIO DE EXISTENCIAS
// Maneja todas las operaciones relacionadas con existencias/inventario
// =======================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

export const existenciaService = {
    
    // =======================================
    // CONSULTAS DE EXISTENCIAS
    // =======================================

    /**
     * Obtener todas las existencias con paginación y filtros
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.page - Página actual
     * @param {number} params.limit - Registros por página
     * @param {string} params.search - Término de búsqueda
     * @param {number} params.bodega_id - ID de bodega específica
     * @param {number} params.categoria_id - ID de categoría
     * @param {boolean} params.stock_bajo - Filtrar por stock bajo
     * @param {boolean} params.sin_stock - Filtrar sin stock
     * @param {string} params.sort_by - Campo de ordenamiento
     * @param {string} params.sort_order - Orden (ASC/DESC)
     */
    async getAllExistencias(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Agregar parámetros si existen
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/existencias?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo existencias:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener existencias por bodega específica
     * @param {number} bodegaId - ID de la bodega
     * @param {Object} params - Parámetros adicionales
     */
    async getExistenciasByBodega(bodegaId, params = {}) {
        try {
            if (!bodegaId) {
                throw new Error('ID de bodega es requerido');
            }

            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const url = `${API_BASE_URL}/existencias/bodega/${bodegaId}${queryParams.toString() ? '?' + queryParams : ''}`;
            const response = await axios.get(url, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo existencias por bodega:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener existencia específica por bodega e item
     * @param {number} bodegaId - ID de la bodega
     * @param {number} itemId - ID del item
     */
    async getExistenciaByBodegaAndItem(bodegaId, itemId) {
        try {
            if (!bodegaId || !itemId) {
                throw new Error('IDs de bodega e item son requeridos');
            }

            const response = await axios.get(`${API_BASE_URL}/existencias/bodega/${bodegaId}/item/${itemId}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo existencia específica:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener resumen de existencias
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    async getResumenExistencias(bodegaId = null) {
        try {
            const params = bodegaId ? `?bodega_id=${bodegaId}` : '';
            const response = await axios.get(`${API_BASE_URL}/existencias/resumen${params}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo resumen de existencias:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener items con stock bajo (usa criterio fijo: cantidad <= 10)
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.bodega_id - ID de bodega
     */
    async getItemsStockBajo(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/existencias/stock-bajo?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo items con stock bajo:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener items sin stock
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    async getItemsSinStock(bodegaId = null) {
        try {
            const params = bodegaId ? `?bodegaId=${bodegaId}` : '';
            const response = await axios.get(`${API_BASE_URL}/existencias/sin-stock${params}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo items sin stock:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // UTILIDADES
    // =======================================

    /**
     * Formatear datos de existencia para mostrar
     * @param {Object} existencia - Datos de existencia
     */
    formatExistenciaForDisplay(existencia) {
        return {
            ...existencia,
            cantidad_formateada: this.formatCantidad(existencia.cantidad_actual),
            valor_total_formateado: this.formatValor(existencia.valor_total),
            ultima_actualizacion_formateada: this.formatFecha(existencia.fecha_modificacion)
        };
    },

    /**
     * Formatear cantidad
     * @param {number} cantidad - Cantidad a formatear
     */
    formatCantidad(cantidad) {
        if (cantidad === null || cantidad === undefined) return '0';
        return parseFloat(cantidad).toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    },

    /**
     * Formatear valor monetario
     * @param {number} valor - Valor a formatear
     */
    formatValor(valor) {
        if (valor === null || valor === undefined) return 'Q0.00';
        return parseFloat(valor).toLocaleString('es-GT', {
            style: 'currency',
            currency: 'GTQ',
            minimumFractionDigits: 2
        });
    },

    /**
     * Formatear fecha
     * @param {string} fecha - Fecha a formatear
     */
    formatFecha(fecha) {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Determinar estado del stock
     * @param {number} cantidad - Cantidad actual
     * @param {number} stockMinimo - Stock mínimo (criterio fijo temporal)
     */
    getEstadoStock(cantidad, stockMinimo = 10) {
        if (cantidad === 0) return 'sin-stock';
        if (cantidad <= stockMinimo) return 'stock-bajo';
        if (cantidad > 100) return 'sobre-stock';
        return 'stock-normal';
    },

    /**
     * Obtener color para el estado del stock
     * @param {string} estado - Estado del stock
     */
    getColorEstadoStock(estado) {
        const colores = {
            'sin-stock': 'text-red-600 bg-red-50',
            'stock-bajo': 'text-yellow-600 bg-yellow-50',
            'sobre-stock': 'text-orange-600 bg-orange-50',
            'stock-normal': 'text-green-600 bg-green-50'
        };
        return colores[estado] || 'text-gray-600 bg-gray-50';
    }
};
