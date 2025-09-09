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

const presentacionService = {
  // Obtener todas las presentaciones
  getAllPresentaciones: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presentaciones`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener una presentación por ID
  getPresentacionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presentaciones/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener presentaciones por unidad de medida
  getPresentacionesByUnidadMedida: async (unidadMedidaId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/presentaciones/unidad-medida/${unidadMedidaId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear presentación
  createPresentacion: async (presentacionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/presentaciones`,
        presentacionData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar presentación
  updatePresentacion: async (id, presentacionData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/presentaciones/${id}`, 
        presentacionData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar presentación
  deletePresentacion: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/presentaciones/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de presentaciones
  getPresentacionStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/presentaciones/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Buscar presentaciones
  searchPresentaciones: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/presentaciones/search?q=${encodeURIComponent(searchTerm)}`, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener todas las unidades de medida (para los selectores)
  getAllUnidadesMedida: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/unidades-medida`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default presentacionService;
