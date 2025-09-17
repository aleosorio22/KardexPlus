// =======================================
// SERVICIO DE MOVIMIENTOS DE INVENTARIO
// Maneja todas las operaciones relacionadas con movimientos de stock
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

export const movimientoService = {
    
    // =======================================
    // CONSULTAS DE MOVIMIENTOS
    // =======================================

    /**
     * Obtener todos los movimientos con paginación y filtros
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.page - Página actual
     * @param {number} params.limit - Registros por página
     * @param {string} params.tipo_movimiento - Tipo de movimiento (Entrada, Salida, Transferencia, Ajuste)
     * @param {number} params.bodega_id - ID de bodega específica
     * @param {number} params.usuario_id - ID de usuario
     * @param {string} params.fecha_inicio - Fecha inicial (YYYY-MM-DD)
     * @param {string} params.fecha_fin - Fecha final (YYYY-MM-DD)
     * @param {number} params.item_id - ID del item
     * @param {string} params.search - Término de búsqueda
     */
    async getAllMovimientos(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            // Agregar parámetros si existen
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/movimientos?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo movimientos:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener movimiento por ID con detalle completo
     * @param {number} movimientoId - ID del movimiento
     */
    async getMovimientoById(movimientoId) {
        try {
            if (!movimientoId) {
                throw new Error('ID de movimiento es requerido');
            }

            const response = await axios.get(`${API_BASE_URL}/movimientos/${movimientoId}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo movimiento por ID:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener kardex de un item específico
     * @param {number} itemId - ID del item
     * @param {Object} params - Parámetros adicionales
     * @param {number} params.bodega_id - ID de bodega (opcional)
     * @param {string} params.fecha_inicio - Fecha inicial
     * @param {string} params.fecha_fin - Fecha final
     */
    async getKardexItem(itemId, params = {}) {
        try {
            if (!itemId) {
                throw new Error('ID de item es requerido');
            }

            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const url = `${API_BASE_URL}/movimientos/kardex/${itemId}${queryParams.toString() ? '?' + queryParams : ''}`;
            const response = await axios.get(url, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo kardex:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener resumen de movimientos por período
     * @param {string} fechaInicio - Fecha inicial (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha final (YYYY-MM-DD)
     * @param {string} tipoMovimiento - Tipo específico (opcional)
     */
    async getResumenPorPeriodo(fechaInicio, fechaFin, tipoMovimiento = null) {
        try {
            if (!fechaInicio || !fechaFin) {
                throw new Error('Las fechas de inicio y fin son requeridas');
            }

            const params = new URLSearchParams({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin
            });

            if (tipoMovimiento) {
                params.append('tipo_movimiento', tipoMovimiento);
            }

            const response = await axios.get(`${API_BASE_URL}/movimientos/resumen/periodo?${params}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo resumen por período:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener stock actual de un item en una bodega
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    async getStockActual(itemId, bodegaId) {
        try {
            if (!itemId || !bodegaId) {
                throw new Error('IDs de item y bodega son requeridos');
            }

            const response = await axios.get(`${API_BASE_URL}/movimientos/stock/${itemId}/${bodegaId}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo stock actual:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // MOVIMIENTOS POR TIPO
    // =======================================

    /**
     * Obtener solo movimientos de entrada
     * @param {Object} params - Parámetros de consulta
     */
    async getEntradas(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/movimientos/tipo/entradas?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo entradas:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener solo movimientos de salida
     * @param {Object} params - Parámetros de consulta
     */
    async getSalidas(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/movimientos/tipo/salidas?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo salidas:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener solo movimientos de transferencia
     * @param {Object} params - Parámetros de consulta
     */
    async getTransferencias(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/movimientos/tipo/transferencias?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo transferencias:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // CREACIÓN DE MOVIMIENTOS
    // =======================================

    /**
     * Crear movimiento de entrada
     * @param {Object} movimientoData - Datos del movimiento
     * @param {number} movimientoData.Destino_Bodega_Id - ID de la bodega destino
     * @param {string} movimientoData.Recepcionista - Nombre del recepcionista
     * @param {string} movimientoData.Motivo - Motivo del movimiento
     * @param {string} movimientoData.Observaciones - Observaciones adicionales
     * @param {Array} items - Array de items con Item_Id y Cantidad
     */
    async crearEntrada(movimientoData, items) {
        try {
            // Validaciones básicas
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('La bodega de destino es requerida');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            const payload = {
                movimiento: movimientoData,
                items: items
            };

            const response = await axios.post(`${API_BASE_URL}/movimientos/entradas`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error creando entrada:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Crear movimiento de salida
     * @param {Object} movimientoData - Datos del movimiento
     * @param {number} movimientoData.Origen_Bodega_Id - ID de la bodega origen
     * @param {string} movimientoData.Recepcionista - Nombre del responsable
     * @param {string} movimientoData.Motivo - Motivo del movimiento
     * @param {string} movimientoData.Observaciones - Observaciones adicionales
     * @param {Array} items - Array de items con Item_Id y Cantidad
     */
    async crearSalida(movimientoData, items) {
        try {
            // Validaciones básicas
            if (!movimientoData.Origen_Bodega_Id) {
                throw new Error('La bodega de origen es requerida');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            const payload = {
                movimiento: movimientoData,
                items: items
            };

            const response = await axios.post(`${API_BASE_URL}/movimientos/salidas`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error creando salida:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Crear movimiento de transferencia
     * @param {Object} movimientoData - Datos del movimiento
     * @param {number} movimientoData.Origen_Bodega_Id - ID de la bodega origen
     * @param {number} movimientoData.Destino_Bodega_Id - ID de la bodega destino
     * @param {string} movimientoData.Recepcionista - Nombre del responsable
     * @param {string} movimientoData.Motivo - Motivo del movimiento
     * @param {string} movimientoData.Observaciones - Observaciones adicionales
     * @param {Array} items - Array de items con Item_Id y Cantidad
     */
    async crearTransferencia(movimientoData, items) {
        try {
            // Validaciones básicas
            if (!movimientoData.Origen_Bodega_Id || !movimientoData.Destino_Bodega_Id) {
                throw new Error('Las bodegas de origen y destino son requeridas');
            }

            if (movimientoData.Origen_Bodega_Id === movimientoData.Destino_Bodega_Id) {
                throw new Error('Las bodegas de origen y destino deben ser diferentes');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            const payload = {
                movimiento: movimientoData,
                items: items
            };

            const response = await axios.post(`${API_BASE_URL}/movimientos/transferencias`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error creando transferencia:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Crear movimiento de ajuste
     * @param {Object} movimientoData - Datos del movimiento
     * @param {number} movimientoData.Destino_Bodega_Id - ID de la bodega donde se hace el ajuste
     * @param {string} movimientoData.Recepcionista - Nombre del responsable
     * @param {string} movimientoData.Motivo - Motivo del ajuste (obligatorio)
     * @param {string} movimientoData.Observaciones - Observaciones adicionales
     * @param {Array} items - Array de items con Item_Id y Cantidad
     */
    async crearAjuste(movimientoData, items) {
        try {
            // Validaciones básicas
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('La bodega es requerida para ajustes');
            }

            if (!movimientoData.Motivo) {
                throw new Error('El motivo es obligatorio para ajustes');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            const payload = {
                movimiento: movimientoData,
                items: items
            };

            const response = await axios.post(`${API_BASE_URL}/movimientos/ajustes`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error creando ajuste:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Aprobar movimiento
     * @param {number} movimientoId - ID del movimiento
     * @param {string} observaciones - Observaciones de la aprobación
     */
    async aprobarMovimiento(movimientoId, observaciones = '') {
        try {
            if (!movimientoId) {
                throw new Error('ID de movimiento es requerido');
            }

            const payload = { observaciones };

            const response = await axios.put(`${API_BASE_URL}/movimientos/${movimientoId}/aprobar`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error aprobando movimiento:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // UTILIDADES Y VALIDACIONES
    // =======================================

    /**
     * Validar disponibilidad de stock antes de crear movimiento
     * @param {number} bodegaId - ID de la bodega
     * @param {Array} items - Array de items con Item_Id y Cantidad
     */
    async validarStock(bodegaId, items) {
        try {
            if (!bodegaId || !items || !Array.isArray(items)) {
                throw new Error('Bodega ID e items son requeridos');
            }

            const payload = {
                bodega_id: bodegaId,
                items: items
            };

            const response = await axios.post(`${API_BASE_URL}/movimientos/validar-stock`, payload, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error validando stock:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // REPORTES ESPECIALIZADOS
    // =======================================

    /**
     * Obtener movimientos de una bodega específica
     * @param {number} bodegaId - ID de la bodega
     * @param {Object} params - Parámetros adicionales
     */
    async getMovimientosByBodega(bodegaId, params = {}) {
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

            const url = `${API_BASE_URL}/movimientos/reportes/por-bodega/${bodegaId}${queryParams.toString() ? '?' + queryParams : ''}`;
            const response = await axios.get(url, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo movimientos por bodega:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener movimientos del día actual
     * @param {Object} params - Parámetros adicionales
     */
    async getMovimientosHoy(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const url = `${API_BASE_URL}/movimientos/reportes/hoy${queryParams.toString() ? '?' + queryParams : ''}`;
            const response = await axios.get(url, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo movimientos del día:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // FORMATEO Y UTILIDADES
    // =======================================

    /**
     * Formatear datos de movimiento para mostrar
     * @param {Object} movimiento - Datos del movimiento
     */
    formatMovimientoForDisplay(movimiento) {
        return {
            ...movimiento,
            fecha_formateada: this.formatFecha(movimiento.Fecha),
            tipo_icono: this.getTipoMovimientoIcon(movimiento.Tipo_Movimiento),
            tipo_color: this.getTipoMovimientoColor(movimiento.Tipo_Movimiento)
        };
    },

    /**
     * Obtener icono para tipo de movimiento
     * @param {string} tipo - Tipo de movimiento
     */
    getTipoMovimientoIcon(tipo) {
        const iconos = {
            'Entrada': '↓',
            'Salida': '↑',
            'Transferencia': '↔',
            'Ajuste': '⚖'
        };
        return iconos[tipo] || '?';
    },

    /**
     * Obtener color para tipo de movimiento
     * @param {string} tipo - Tipo de movimiento
     */
    getTipoMovimientoColor(tipo) {
        const colores = {
            'Entrada': 'text-green-600 bg-green-50',
            'Salida': 'text-red-600 bg-red-50',
            'Transferencia': 'text-blue-600 bg-blue-50',
            'Ajuste': 'text-yellow-600 bg-yellow-50'
        };
        return colores[tipo] || 'text-gray-600 bg-gray-50';
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
     * Formatear cantidad
     * @param {number} cantidad - Cantidad a formatear
     */
    formatCantidad(cantidad) {
        if (cantidad === null || cantidad === undefined) return '0';
        return parseFloat(cantidad).toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }
};

export default movimientoService;