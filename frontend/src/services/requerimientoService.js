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

const requerimientoService = {
  // =======================================
  // CONSULTAS DE REQUERIMIENTOS
  // =======================================

  // Obtener todos los requerimientos (con permisos)
  getAllRequerimientos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.search) queryParams.append('search', params.search);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.bodega_id) queryParams.append('bodega_id', params.bodega_id);
      if (params.origen_bodega_id) queryParams.append('origen_bodega_id', params.origen_bodega_id);
      if (params.destino_bodega_id) queryParams.append('destino_bodega_id', params.destino_bodega_id);
      if (params.usuario_solicita_id) queryParams.append('usuario_solicita_id', params.usuario_solicita_id);
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

      const url = `${API_BASE_URL}/requerimientos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todos los requerimientos del sistema (solo admin)
  getRequerimientosTodos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

      const url = `${API_BASE_URL}/requerimientos/ver-todos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener mis requerimientos (del usuario autenticado)
  getMisRequerimientos: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

      const url = `${API_BASE_URL}/requerimientos/mis-requerimientos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener un requerimiento por ID
  getRequerimientoById: async (requerimientoId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/${requerimientoId}`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos por estado
  getRequerimientosByEstado: async (estado) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estado/${estado}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos por bodega
  getRequerimientosByBodega: async (bodegaId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/bodega/${bodegaId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // CREACIÓN DE REQUERIMIENTOS
  // =======================================

  // Crear un nuevo requerimiento
  crearRequerimiento: async (requerimientoData, items) => {
    try {
      const payload = {
        requerimiento: requerimientoData,
        items: items
      };

      const response = await axios.post(
        `${API_BASE_URL}/requerimientos`,
        payload,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Validar datos antes de crear requerimiento
  validarCreacion: async (requerimientoData, items) => {
    try {
      const payload = {
        requerimiento: requerimientoData,
        items: items
      };

      const response = await axios.post(
        `${API_BASE_URL}/requerimientos/validar-creacion`,
        payload,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // GESTIÓN DE REQUERIMIENTOS
  // =======================================

  // Aprobar un requerimiento
  aprobarRequerimiento: async (requerimientoId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requerimientos/${requerimientoId}/aprobar`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Rechazar un requerimiento
  rechazarRequerimiento: async (requerimientoId, observaciones) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requerimientos/${requerimientoId}/rechazar`,
        { observaciones },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Despachar un requerimiento
  despacharRequerimiento: async (requerimientoId, items, observaciones_despacho = '') => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requerimientos/${requerimientoId}/despachar`,
        { 
          items, 
          observaciones_despacho 
        },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cancelar un requerimiento propio
  cancelarRequerimiento: async (requerimientoId, observaciones) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requerimientos/${requerimientoId}/cancelar`,
        { observaciones },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cancelar requerimiento de otros usuarios (solo admin)
  cancelarRequerimientoOtros: async (requerimientoId, observaciones) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/requerimientos/${requerimientoId}/cancelar-otros`,
        { observaciones },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // CONSULTAS ESPECIALIZADAS
  // =======================================

  // Obtener requerimientos pendientes
  getRequerimientosPendientes: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/pendientes`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos para despacho
  getRequerimientosParaDespacho: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/para-despacho`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos aprobados
  getRequerimientosAprobados: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/aprobados`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos completados
  getRequerimientosCompletados: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/completados`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos en despacho
  getRequerimientosEnDespacho: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/en-despacho`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos parcialmente despachados
  getRequerimientosParcialmenteDespachados: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/estados/parcialmente-despachados`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // =======================================
  // REPORTES Y ESTADÍSTICAS
  // =======================================

  // Obtener estadísticas de requerimientos
  getEstadisticas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

      const url = `${API_BASE_URL}/requerimientos/reportes/estadisticas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Generar reporte completo
  generarReporte: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.bodega_id) queryParams.append('bodega_id', params.bodega_id);

      const url = `${API_BASE_URL}/requerimientos/reportes/generar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos por bodega (reporte)
  getRequerimientosPorBodega: async (bodegaId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.tipo) queryParams.append('tipo', params.tipo); // 'origen' o 'destino'
      if (params.fecha_inicio) queryParams.append('fecha_inicio', params.fecha_inicio);
      if (params.fecha_fin) queryParams.append('fecha_fin', params.fecha_fin);

      const url = `${API_BASE_URL}/requerimientos/reportes/por-bodega/${bodegaId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos por usuario (reporte)
  getRequerimientosPorUsuario: async (usuarioId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/reportes/por-usuario/${usuarioId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener requerimientos del día
  getRequerimientosHoy: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/requerimientos/reportes/hoy`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export { requerimientoService };
export default requerimientoService;