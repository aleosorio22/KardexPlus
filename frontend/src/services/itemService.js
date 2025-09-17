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

const itemService = {
  // Obtener todos los items
  getAllItems: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener items con paginación y filtros
  getItemsWithPagination: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.categoria) queryParams.append('categoria', params.categoria);
      if (params.estado) queryParams.append('estado', params.estado);

      const url = `${API_BASE_URL}/items/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener un item por ID
  getItemById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/items/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear item
  createItem: async (itemData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/items`,
        itemData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar item
  updateItem: async (id, itemData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/items/${id}`, 
        itemData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar item (desactivar)
  deleteItem: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/items/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Restaurar item (activar)
  restoreItem: async (id) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/items/${id}/restore`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Toggle estado del item
  toggleItemStatus: async (id) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/items/${id}/toggle-status`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener items por categoría
  getItemsByCategory: async (categoriaId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/items/categoria/${categoriaId}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de items
  getItemStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/items/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Buscar items
  searchItems: async (searchTerm) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/items/search?q=${encodeURIComponent(searchTerm)}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Verificar si un item existe
  checkItemExists: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/items/${id}/exists`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export { itemService };
export default itemService;
