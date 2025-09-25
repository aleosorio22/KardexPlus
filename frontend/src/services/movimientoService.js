// =======================================
// SERVICIO DE MOVIMIENTOS DE INVENTARIO
// Maneja todas las operaciones relacionadas con movimientos de stock
// =======================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3499/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Función auxiliar para validar items con presentaciones
const validateItems = (items) => {
    if (!items || items.length === 0) {
        throw new Error('Debe especificar al menos un item');
    }

    items.forEach((item, index) => {
        if (!item.Item_Id) {
            throw new Error(`Item ${index + 1}: ID del item es requerido`);
        }

        // Si tiene presentación, debe tener Cantidad_Presentacion
        if (item.Item_Presentaciones_Id && (!item.Cantidad_Presentacion || item.Cantidad_Presentacion <= 0)) {
            throw new Error(`Item ${index + 1}: Cantidad_Presentacion debe ser mayor a 0 cuando se especifica presentación`);
        }

        // Si no tiene presentación, debe tener Cantidad
        if (!item.Item_Presentaciones_Id && (!item.Cantidad || item.Cantidad <= 0)) {
            throw new Error(`Item ${index + 1}: Cantidad debe ser mayor a 0 para movimientos sin presentación`);
        }
    });
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
                if (value !== null && value !== undefined && value !== '') {
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
     * @param {Array} items - Array de items
     * @param {number} items[].Item_Id - ID del item (requerido)
     * @param {number} items[].Cantidad - Cantidad en unidades base (opcional si hay presentación)
     * @param {number} items[].Item_Presentaciones_Id - ID de la presentación (opcional)
     * @param {number} items[].Cantidad_Presentacion - Cantidad de presentaciones (requerido si Item_Presentaciones_Id)
     * @param {boolean} items[].Es_Movimiento_Por_Presentacion - Calculado automáticamente por el backend
     */
    async crearEntrada(movimientoData, items) {
        try {
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('Bodega destino es requerida');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validación de items con presentaciones
            items.forEach((item, index) => {
                if (!item.Item_Id) {
                    throw new Error(`Item ${index + 1}: ID del item es requerido`);
                }

                // Si tiene presentación, debe tener Cantidad_Presentacion
                if (item.Item_Presentaciones_Id && !item.Cantidad_Presentacion) {
                    throw new Error(`Item ${index + 1}: Cantidad_Presentacion es requerida cuando se especifica presentación`);
                }

                // Si no tiene presentación, debe tener Cantidad
                if (!item.Item_Presentaciones_Id && !item.Cantidad) {
                    throw new Error(`Item ${index + 1}: Cantidad es requerida para movimientos sin presentación`);
                }
            });

            const response = await axios.post(`${API_BASE_URL}/movimientos/entradas`, {
                movimiento: movimientoData,
                items: items
            }, getAuthHeaders());

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
     * @param {Array} items - Array de items
     * @param {number} items[].Item_Id - ID del item (requerido)
     * @param {number} items[].Cantidad - Cantidad en unidades base (opcional si hay presentación)
     * @param {number} items[].Item_Presentaciones_Id - ID de la presentación (opcional)
     * @param {number} items[].Cantidad_Presentacion - Cantidad de presentaciones (requerido si Item_Presentaciones_Id)
     */
    async crearSalida(movimientoData, items) {
        try {
            if (!movimientoData.Origen_Bodega_Id) {
                throw new Error('Bodega origen es requerida');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validación de items con presentaciones
            items.forEach((item, index) => {
                if (!item.Item_Id) {
                    throw new Error(`Item ${index + 1}: ID del item es requerido`);
                }

                // Si tiene presentación, debe tener Cantidad_Presentacion
                if (item.Item_Presentaciones_Id && !item.Cantidad_Presentacion) {
                    throw new Error(`Item ${index + 1}: Cantidad_Presentacion es requerida cuando se especifica presentación`);
                }

                // Si no tiene presentación, debe tener Cantidad
                if (!item.Item_Presentaciones_Id && !item.Cantidad) {
                    throw new Error(`Item ${index + 1}: Cantidad es requerida para movimientos sin presentación`);
                }
            });

            const response = await axios.post(`${API_BASE_URL}/movimientos/salidas`, {
                movimiento: movimientoData,
                items: items
            }, getAuthHeaders());

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
     * @param {Array} items - Array de items
     * @param {number} items[].Item_Id - ID del item (requerido)
     * @param {number} items[].Cantidad - Cantidad en unidades base (opcional si hay presentación)
     * @param {number} items[].Item_Presentaciones_Id - ID de la presentación (opcional)
     * @param {number} items[].Cantidad_Presentacion - Cantidad de presentaciones (requerido si Item_Presentaciones_Id)
     */
    async crearTransferencia(movimientoData, items) {
        try {
            if (!movimientoData.Origen_Bodega_Id || !movimientoData.Destino_Bodega_Id) {
                throw new Error('Bodega origen y destino son requeridas');
            }

            if (movimientoData.Origen_Bodega_Id === movimientoData.Destino_Bodega_Id) {
                throw new Error('La bodega origen debe ser diferente a la destino');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            // Validación de items con presentaciones
            items.forEach((item, index) => {
                if (!item.Item_Id) {
                    throw new Error(`Item ${index + 1}: ID del item es requerido`);
                }

                // Si tiene presentación, debe tener Cantidad_Presentacion
                if (item.Item_Presentaciones_Id && !item.Cantidad_Presentacion) {
                    throw new Error(`Item ${index + 1}: Cantidad_Presentacion es requerida cuando se especifica presentación`);
                }

                // Si no tiene presentación, debe tener Cantidad
                if (!item.Item_Presentaciones_Id && !item.Cantidad) {
                    throw new Error(`Item ${index + 1}: Cantidad es requerida para movimientos sin presentación`);
                }
            });

            const response = await axios.post(`${API_BASE_URL}/movimientos/transferencias`, {
                movimiento: movimientoData,
                items: items
            }, getAuthHeaders());

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
            if (!movimientoData.Destino_Bodega_Id) {
                throw new Error('Bodega es requerida para el ajuste');
            }

            if (!movimientoData.Motivo) {
                throw new Error('Motivo del ajuste es requerido');
            }

            if (!items || items.length === 0) {
                throw new Error('Debe especificar al menos un item');
            }

            const response = await axios.post(`${API_BASE_URL}/movimientos/ajustes`, {
                movimiento: movimientoData,
                items: items
            }, getAuthHeaders());

            return response.data;
            
        } catch (error) {
            console.error('Error creando ajuste:', error);
            throw error.response ? error.response.data : error;
        }
    },

    // =======================================
    // FORMATEO Y UTILIDADES
    // =======================================

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
    },

    // =======================================
    // GENERACIÓN DE DOCUMENTOS
    // =======================================

    /**
     * Generar ticket PDF para imprimir
     * @param {Object} datosTicket - Datos completos del ticket
     * @param {Object} datosTicket.movimiento - Datos del movimiento
     * @param {Array} datosTicket.items - Items del movimiento
     * @param {string} datosTicket.tipo - Tipo de movimiento
     * @param {Array} datosTicket.bodegas - Lista de bodegas
     * @param {string} datosTicket.usuario - Usuario responsable
     * @param {Object} datosTicket.totales - Totales calculados
     */
    async generarTicketPDF(datosTicket) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/movimientos/generar-ticket-pdf`, 
                datosTicket, 
                {
                    ...getAuthHeaders(),
                    responseType: 'blob' // Importante para recibir el PDF como blob
                }
            );

            if (response.status === 200) {
                // Crear URL del blob para descargar/imprimir
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Abrir en nueva pestaña para imprimir
                const printWindow = window.open(url, '_blank');
                
                if (printWindow) {
                    // Auto-abrir diálogo de impresión
                    printWindow.onload = () => {
                        setTimeout(() => {
                            printWindow.print();
                        }, 500);
                    };
                    
                    return {
                        success: true,
                        message: 'Ticket generado exitosamente',
                        url: url
                    };
                } else {
                    // Si no se pudo abrir ventana, ofrecer descarga
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `ticket-${datosTicket.tipo}-${Date.now()}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    return {
                        success: true,
                        message: 'Ticket descargado exitosamente'
                    };
                }
            }
            
        } catch (error) {
            console.error('Error generando ticket PDF:', error);
            
            let message = 'Error al generar el ticket';
            
            if (error.response?.status === 403) {
                message = 'No tiene permisos para generar tickets';
            } else if (error.response?.status === 400) {
                message = error.response.data?.message || 'Datos inválidos para generar el ticket';
            }
            
            throw {
                success: false,
                message: message,
                error: error.response ? error.response.data : error
            };
        }
    }
};

export default movimientoService;