// =======================================
// SERVICIO DE PARÁMETROS DE ITEMS POR BODEGA
// Maneja toda la configuración de stock por bodega específica
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

export const itemBodegaParamService = {
    
    // =======================================
    // CONSULTAS GENERALES
    // =======================================

    /**
     * Obtener todos los parámetros con paginación y filtros
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.page - Página actual
     * @param {number} params.limit - Registros por página
     * @param {number} params.bodega_id - ID de bodega específica
     * @param {number} params.item_id - ID de item específico
     * @param {number} params.categoria_id - ID de categoría
     * @param {boolean} params.activos_bodega - Filtrar solo items activos en bodega
     * @param {string} params.search - Término de búsqueda
     */
    async getAllParametros(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${API_BASE_URL}/item-bodega-parametros?${queryParams}`, getAuthHeaders());
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo parámetros:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener parámetros específicos por item y bodega
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    async getParametroByItemAndBodega(itemId, bodegaId) {
        try {
            if (!itemId || !bodegaId) {
                throw new Error('IDs de item y bodega son requeridos');
            }

            const response = await axios.get(
                `${API_BASE_URL}/item-bodega-parametros/item/${itemId}/bodega/${bodegaId}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo parámetros específicos:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener parámetros por bodega específica
     * @param {number} bodegaId - ID de la bodega
     */
    async getParametrosByBodega(bodegaId) {
        try {
            if (!bodegaId) {
                throw new Error('ID de bodega es requerido');
            }

            const response = await axios.get(
                `${API_BASE_URL}/item-bodega-parametros/bodega/${bodegaId}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo parámetros por bodega:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener parámetros por item específico
     * @param {number} itemId - ID del item
     */
    async getParametrosByItem(itemId) {
        try {
            if (!itemId) {
                throw new Error('ID de item es requerido');
            }

            const response = await axios.get(
                `${API_BASE_URL}/item-bodega-parametros/item/${itemId}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo parámetros por item:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // OPERACIONES CRUD
    // =======================================

    /**
     * Crear nuevos parámetros
     * @param {Object} parametroData - Datos del parámetro
     * @param {number} parametroData.Item_Id - ID del item
     * @param {number} parametroData.Bodega_Id - ID de la bodega
     * @param {number} parametroData.Stock_Min_Bodega - Stock mínimo
     * @param {number} parametroData.Stock_Max_Bodega - Stock máximo (opcional)
     * @param {number} parametroData.Punto_Reorden - Punto de reorden (opcional)
     * @param {boolean} parametroData.Es_Item_Activo_Bodega - Si el item está activo en la bodega
     */
    async createParametro(parametroData) {
        try {
            // Validaciones básicas
            if (!parametroData.Item_Id || !parametroData.Bodega_Id) {
                throw new Error('Item_Id y Bodega_Id son requeridos');
            }

            if (parametroData.Stock_Min_Bodega !== undefined && parametroData.Stock_Min_Bodega < 0) {
                throw new Error('El stock mínimo no puede ser negativo');
            }

            if (parametroData.Stock_Max_Bodega !== undefined && parametroData.Stock_Max_Bodega !== null && 
                parametroData.Stock_Max_Bodega < (parametroData.Stock_Min_Bodega || 0)) {
                throw new Error('El stock máximo debe ser mayor o igual al stock mínimo');
            }

            const response = await axios.post(
                `${API_BASE_URL}/item-bodega-parametros`, 
                parametroData, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error creando parámetros:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Actualizar parámetros existentes
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     * @param {Object} updateData - Datos a actualizar
     */
    async updateParametro(itemId, bodegaId, updateData) {
        try {
            if (!itemId || !bodegaId) {
                throw new Error('IDs de item y bodega son requeridos');
            }

            // Validaciones de rango
            if (updateData.Stock_Min_Bodega !== undefined && updateData.Stock_Min_Bodega < 0) {
                throw new Error('El stock mínimo no puede ser negativo');
            }

            if (updateData.Stock_Max_Bodega !== undefined && updateData.Stock_Max_Bodega !== null && 
                updateData.Stock_Max_Bodega < (updateData.Stock_Min_Bodega || 0)) {
                throw new Error('El stock máximo debe ser mayor o igual al stock mínimo');
            }

            const response = await axios.put(
                `${API_BASE_URL}/item-bodega-parametros/item/${itemId}/bodega/${bodegaId}`, 
                updateData, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error actualizando parámetros:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Crear o actualizar parámetros (upsert)
     * @param {Object} parametroData - Datos del parámetro
     */
    async createOrUpdateParametro(parametroData) {
        try {
            // Validaciones básicas (igual que en create)
            if (!parametroData.Item_Id || !parametroData.Bodega_Id) {
                throw new Error('Item_Id y Bodega_Id son requeridos');
            }

            if (parametroData.Stock_Min_Bodega !== undefined && parametroData.Stock_Min_Bodega < 0) {
                throw new Error('El stock mínimo no puede ser negativo');
            }

            if (parametroData.Stock_Max_Bodega !== undefined && parametroData.Stock_Max_Bodega !== null && 
                parametroData.Stock_Max_Bodega < (parametroData.Stock_Min_Bodega || 0)) {
                throw new Error('El stock máximo debe ser mayor o igual al stock mínimo');
            }

            const response = await axios.post(
                `${API_BASE_URL}/item-bodega-parametros/upsert`, 
                parametroData, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error creando/actualizando parámetros:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Eliminar parámetros específicos
     * @param {number} itemId - ID del item
     * @param {number} bodegaId - ID de la bodega
     */
    async deleteParametro(itemId, bodegaId) {
        try {
            if (!itemId || !bodegaId) {
                throw new Error('IDs de item y bodega son requeridos');
            }

            const response = await axios.delete(
                `${API_BASE_URL}/item-bodega-parametros/item/${itemId}/bodega/${bodegaId}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error eliminando parámetros:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // CONSULTAS ESPECIALES
    // =======================================

    /**
     * Obtener items con stock bajo según parámetros
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    async getItemsStockBajo(bodegaId = null) {
        try {
            const params = bodegaId ? `?bodegaId=${bodegaId}` : '';
            const response = await axios.get(
                `${API_BASE_URL}/item-bodega-parametros/stock-bajo${params}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo items con stock bajo:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Obtener items en punto de reorden
     * @param {number} bodegaId - ID de bodega (opcional)
     */
    async getItemsPuntoReorden(bodegaId = null) {
        try {
            const params = bodegaId ? `?bodegaId=${bodegaId}` : '';
            const response = await axios.get(
                `${API_BASE_URL}/item-bodega-parametros/punto-reorden${params}`, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error obteniendo items en punto de reorden:', error);
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Configurar parámetros masivos para una bodega
     * @param {number} bodegaId - ID de la bodega
     * @param {Array} items - Array de items con sus parámetros
     */
    async configurarParametrosMasivos(bodegaId, items) {
        try {
            if (!bodegaId) {
                throw new Error('ID de bodega es requerido');
            }

            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Se requiere un array de items con sus parámetros');
            }

            // Validar estructura básica de cada item
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (!item.Item_Id) {
                    throw new Error(`Item en posición ${i}: Item_Id es obligatorio`);
                }

                if (item.Stock_Min_Bodega !== undefined && item.Stock_Min_Bodega < 0) {
                    throw new Error(`Item en posición ${i}: Stock mínimo no puede ser negativo`);
                }

                if (item.Stock_Max_Bodega !== undefined && item.Stock_Max_Bodega !== null && 
                    item.Stock_Max_Bodega < (item.Stock_Min_Bodega || 0)) {
                    throw new Error(`Item en posición ${i}: Stock máximo debe ser mayor o igual al mínimo`);
                }
            }

            const response = await axios.post(
                `${API_BASE_URL}/item-bodega-parametros/bodega/${bodegaId}/configurar-masivo`, 
                { items }, 
                getAuthHeaders()
            );
            return response.data;
            
        } catch (error) {
            console.error('Error en configuración masiva:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // UTILIDADES
    // =======================================

    /**
     * Formatear datos de parámetro para mostrar
     * @param {Object} parametro - Datos del parámetro
     */
    formatParametroForDisplay(parametro) {
        return {
            ...parametro,
            stock_min_formateado: this.formatStock(parametro.Stock_Min_Bodega),
            stock_max_formateado: this.formatStock(parametro.Stock_Max_Bodega),
            punto_reorden_formateado: this.formatStock(parametro.Punto_Reorden),
            fecha_configuracion_formateada: this.formatFecha(parametro.Fecha_Configuracion),
            estado_configuracion: this.getEstadoConfiguracion(parametro)
        };
    },

    /**
     * Formatear valores de stock
     * @param {number} stock - Valor de stock a formatear
     */
    formatStock(stock) {
        if (stock === null || stock === undefined) return 'No configurado';
        return parseInt(stock).toLocaleString('es-ES');
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
     * Determinar estado de configuración
     * @param {Object} parametro - Objeto parámetro
     */
    getEstadoConfiguracion(parametro) {
        if (!parametro.Es_Item_Activo_Bodega) return 'inactivo';
        if (parametro.Stock_Min_Bodega === null || parametro.Stock_Min_Bodega === undefined) return 'sin-configurar';
        if (parametro.Stock_Max_Bodega === null && parametro.Punto_Reorden === null) return 'basico';
        return 'completo';
    },

    /**
     * Obtener color para el estado de configuración
     * @param {string} estado - Estado de configuración
     */
    getColorEstadoConfiguracion(estado) {
        const colores = {
            'sin-configurar': 'text-red-600 bg-red-50',
            'basico': 'text-yellow-600 bg-yellow-50',
            'completo': 'text-green-600 bg-green-50',
            'inactivo': 'text-gray-600 bg-gray-50'
        };
        return colores[estado] || 'text-gray-600 bg-gray-50';
    },

    /**
     * Determinar estado del stock basado en parámetros
     * @param {number} cantidadActual - Cantidad actual en existencias
     * @param {Object} parametros - Parámetros de stock
     */
    getEstadoStockConParametros(cantidadActual, parametros) {
        if (cantidadActual === 0) return 'sin-stock';
        
        if (parametros.Stock_Min_Bodega && cantidadActual < parametros.Stock_Min_Bodega) {
            return 'stock-bajo';
        }
        
        if (parametros.Stock_Max_Bodega && cantidadActual > parametros.Stock_Max_Bodega) {
            return 'sobre-stock';
        }
        
        if (parametros.Punto_Reorden && cantidadActual <= parametros.Punto_Reorden) {
            return 'punto-reorden';
        }
        
        return 'stock-normal';
    },

    /**
     * Validar coherencia de parámetros
     * @param {Object} parametros - Parámetros a validar
     */
    validarParametros(parametros) {
        const errores = [];

        if (parametros.Stock_Min_Bodega !== undefined && parametros.Stock_Min_Bodega < 0) {
            errores.push('El stock mínimo no puede ser negativo');
        }

        if (parametros.Stock_Max_Bodega !== undefined && parametros.Stock_Max_Bodega !== null) {
            if (parametros.Stock_Max_Bodega < 0) {
                errores.push('El stock máximo no puede ser negativo');
            }
            
            if (parametros.Stock_Min_Bodega && parametros.Stock_Max_Bodega < parametros.Stock_Min_Bodega) {
                errores.push('El stock máximo debe ser mayor o igual al stock mínimo');
            }
        }

        if (parametros.Punto_Reorden !== undefined && parametros.Punto_Reorden !== null && parametros.Punto_Reorden < 0) {
            errores.push('El punto de reorden no puede ser negativo');
        }

        return errores;
    },

    /**
     * Generar template para configuración masiva
     * @param {Array} items - Array de items
     * @param {Object} parametrosDefault - Parámetros por defecto
     */
    generarTemplateConfiguracion(items, parametrosDefault = {}) {
        return items.map(item => ({
            Item_Id: item.Item_Id,
            Item_Nombre: item.Item_Nombre,
            Stock_Min_Bodega: parametrosDefault.Stock_Min_Bodega || 0,
            Stock_Max_Bodega: parametrosDefault.Stock_Max_Bodega || null,
            Punto_Reorden: parametrosDefault.Punto_Reorden || null,
            Es_Item_Activo_Bodega: parametrosDefault.Es_Item_Activo_Bodega !== undefined ? 
                parametrosDefault.Es_Item_Activo_Bodega : true
        }));
    }
};