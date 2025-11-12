// =======================================
// SERVICIO DE PLANTILLAS
// Maneja todas las operaciones relacionadas con plantillas de requerimientos, movimientos y compras
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

const plantillaService = {
  
  // =======================================
  // CONSULTAS DE PLANTILLAS
  // =======================================

  /**
   * Obtener todas las plantillas (con filtros opcionales)
   * @param {Object} params - Parámetros de consulta
   * @param {string} params.tipo - Tipo de plantilla (requerimiento, movimiento, compra)
   * @param {boolean} params.activo - Filtrar por estado activo
   * @param {string} params.search - Término de búsqueda
   */
  getAllPlantillas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/plantillas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Obtener plantillas asignadas al usuario actual
   * @param {Object} params - Parámetros de consulta
   */
  getMisPlantillas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `${API_BASE_URL}/plantillas/mis-plantillas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error obteniendo mis plantillas:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Obtener una plantilla por ID (con detalles completos)
   * @param {number} id - ID de la plantilla
   */
  getPlantillaById: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.get(`${API_BASE_URL}/plantillas/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantilla por ID:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Obtener plantillas por tipo
   * @param {string} tipo - Tipo de plantilla (requerimiento, movimiento, compra)
   */
  getPlantillasByTipo: async (tipo) => {
    try {
      if (!tipo) {
        throw new Error('Tipo de plantilla es requerido');
      }

      const response = await axios.get(`${API_BASE_URL}/plantillas/tipo/${tipo}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantillas por tipo:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Obtener estadísticas de plantillas
   */
  getEstadisticas: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plantillas/estadisticas`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas de plantillas:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // CREACIÓN Y ACTUALIZACIÓN
  // =======================================

  /**
   * Crear una nueva plantilla
   * @param {Object} plantillaData - Datos de la plantilla
   * @param {string} plantillaData.nombre - Nombre de la plantilla
   * @param {string} plantillaData.descripcion - Descripción
   * @param {string} plantillaData.tipo - Tipo (requerimiento, movimiento, compra)
   * @param {number} plantillaData.bodega_id - ID de bodega
   * @param {Array} plantillaData.items - Array de items con cantidad
   * @param {Array} plantillaData.usuarios - Array de IDs de usuarios asignados
   */
  crearPlantilla: async (plantillaData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plantillas`,
        plantillaData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error creando plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Actualizar datos generales de una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Object} plantillaData - Datos a actualizar
   */
  actualizarPlantilla: async (id, plantillaData) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.put(
        `${API_BASE_URL}/plantillas/${id}`,
        plantillaData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Actualizar items de una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Array} items - Array de items con cantidad
   */
  actualizarItemsPlantilla: async (id, items) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.put(
        `${API_BASE_URL}/plantillas/${id}/items`,
        { items },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando items de plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // GESTIÓN DE USUARIOS
  // =======================================

  /**
   * Asignar usuarios a una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Array} usuariosIds - Array de IDs de usuarios
   */
  asignarUsuarios: async (id, usuariosIds) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.post(
        `${API_BASE_URL}/plantillas/${id}/asignar-usuarios`,
        { usuarios_ids: usuariosIds },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error asignando usuarios a plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Desasignar usuarios de una plantilla
   * @param {number} id - ID de la plantilla
   * @param {Array} usuariosIds - Array de IDs de usuarios a desasignar
   */
  desasignarUsuarios: async (id, usuariosIds) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.delete(
        `${API_BASE_URL}/plantillas/${id}/desasignar-usuarios`,
        {
          ...getAuthHeaders(),
          data: { usuarios_ids: usuariosIds }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error desasignando usuarios de plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Actualizar permisos de un usuario en una plantilla
   * @param {number} id - ID de la plantilla
   * @param {number} usuarioId - ID del usuario
   * @param {boolean} puedeEditar - Si el usuario puede editar
   */
  actualizarPermisosUsuario: async (id, usuarioId, puedeModificar) => {
    try {
      if (!id || !usuarioId) {
        throw new Error('ID de plantilla y usuario son requeridos');
      }

      const response = await axios.put(
        `${API_BASE_URL}/plantillas/${id}/usuarios/${usuarioId}/permisos`,
        { puede_modificar: puedeModificar },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error actualizando permisos de usuario:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // ELIMINACIÓN Y VALIDACIÓN
  // =======================================

  /**
   * Eliminar una plantilla (soft delete)
   * @param {number} id - ID de la plantilla
   */
  eliminarPlantilla: async (id) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.delete(
        `${API_BASE_URL}/plantillas/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error eliminando plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Validar datos antes de crear plantilla
   * @param {Object} plantillaData - Datos a validar
   */
  validarCreacion: async (plantillaData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/plantillas/validar`,
        plantillaData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error validando plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Duplicar una plantilla existente
   * @param {number} id - ID de la plantilla a duplicar
   * @param {string} nuevoNombre - Nombre para la nueva plantilla (opcional)
   */
  duplicarPlantilla: async (id, nuevoNombre = null) => {
    try {
      if (!id) {
        throw new Error('ID de plantilla es requerido');
      }

      const response = await axios.post(
        `${API_BASE_URL}/plantillas/${id}/duplicar`,
        { nuevo_nombre: nuevoNombre },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error duplicando plantilla:', error);
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // UTILIDADES Y FORMATEO
  // =======================================

  /**
   * Formatear datos de plantilla para mostrar
   * @param {Object} plantilla - Datos de la plantilla
   */
  formatPlantillaForDisplay(plantilla) {
    return {
      ...plantilla,
      tipo_formateado: this.formatTipo(plantilla.tipo),
      total_items_formateado: `${plantilla.total_items || 0} items`,
      total_usuarios_formateado: `${plantilla.total_usuarios || 0} usuarios`,
      fecha_creacion_formateada: this.formatFecha(plantilla.fecha_creacion),
      fecha_modificacion_formateada: this.formatFecha(plantilla.fecha_modificacion),
      estado_badge: this.getEstadoBadge(plantilla.activo)
    };
  },

  /**
   * Formatear tipo de plantilla
   * @param {string} tipo - Tipo de plantilla
   */
  formatTipo(tipo) {
    const tipos = {
      'requerimiento': 'Requerimiento',
      'movimiento': 'Movimiento',
      'compra': 'Compra'
    };
    return tipos[tipo] || tipo;
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
   * Obtener badge de estado
   * @param {boolean} activo - Si la plantilla está activa
   */
  getEstadoBadge(activo) {
    return activo 
      ? { text: 'Activa', color: 'text-green-600 bg-green-50' }
      : { text: 'Inactiva', color: 'text-gray-600 bg-gray-50' };
  },

  /**
   * Obtener color por tipo de plantilla
   * @param {string} tipo - Tipo de plantilla
   */
  getColorByTipo(tipo) {
    const colores = {
      'requerimiento': 'text-blue-600 bg-blue-50',
      'movimiento': 'text-indigo-600 bg-indigo-50',
      'compra': 'text-green-600 bg-green-50'
    };
    return colores[tipo] || 'text-gray-600 bg-gray-50';
  },

  /**
   * Validar estructura de items antes de enviar
   * @param {Array} items - Array de items a validar
   */
  validarEstructuraItems(items) {
    if (!Array.isArray(items)) {
      throw new Error('Items debe ser un array');
    }

    items.forEach((item, index) => {
      if (!item.item_presentacion_id) {
        throw new Error(`Item en posición ${index} debe tener item_presentacion_id`);
      }
      if (!item.cantidad || item.cantidad <= 0) {
        throw new Error(`Item en posición ${index} debe tener cantidad válida`);
      }
    });

    return true;
  }
};

export { plantillaService };
export default plantillaService;
