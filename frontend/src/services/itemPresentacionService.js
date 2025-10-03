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

const itemPresentacionService = {
  // Obtener todas las presentaciones de items
  getAllItemPresentaciones: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/item-presentaciones`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener presentaciones de items con paginación y filtros
  getItemPresentacionesWithPagination: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.itemId) queryParams.append('itemId', params.itemId);

      const url = `${API_BASE_URL}/item-presentaciones/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener una presentación de item por ID
  getItemPresentacionById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/item-presentaciones/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener presentaciones por Item ID
  getItemPresentacionesByItemId: async (itemId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/item-presentaciones/item/${itemId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear nueva presentación de item
  createItemPresentacion: async (itemPresentacionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/item-presentaciones`,
        itemPresentacionData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar presentación de item
  updateItemPresentacion: async (id, itemPresentacionData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/item-presentaciones/${id}`, 
        itemPresentacionData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar presentación de item
  deleteItemPresentacion: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/item-presentaciones/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de presentaciones de items
  getItemPresentacionStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/item-presentaciones/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Buscar presentaciones de items
  searchItemPresentaciones: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/item-presentaciones/search?q=${encodeURIComponent(searchTerm)}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Verificar si una presentación de item existe
  checkItemPresentacionExists: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/item-presentaciones/${id}/exists`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default itemPresentacionService;
