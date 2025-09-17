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

const bodegaService = {
  // Obtener todas las bodegas
  getAllBodegas: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bodegas`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener bodegas con paginación
  getBodegasWithPagination: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de paginación si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `${API_BASE_URL}/bodegas/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener una bodega por ID
  getBodegaById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/bodegas/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear bodega
  createBodega: async (bodegaData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/bodegas`,
        bodegaData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar bodega
  updateBodega: async (id, bodegaData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/bodegas/${id}`, 
        bodegaData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar bodega (soft delete)
  deleteBodega: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/bodegas/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Restaurar bodega (activar)
  restoreBodega: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/bodegas/${id}/restore`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de bodegas
  getBodegaStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bodegas/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Buscar bodegas
  searchBodegas: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bodegas/search?term=${encodeURIComponent(searchTerm)}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener bodegas activas para selects/dropdowns
  getActiveBodegas: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bodegas/active`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener bodegas por responsable
  getBodegasByResponsable: async (responsableId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/bodegas/responsable/${responsableId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export { bodegaService };
export default bodegaService;
