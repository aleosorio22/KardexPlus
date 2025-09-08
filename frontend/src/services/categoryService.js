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

const categoryService = {
  // Obtener todas las categorías
  getAllCategories: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener categorías con paginación y filtros
  getCategoriesWithPagination: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const url = `${API_BASE_URL}/categories/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener una categoría por ID
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear categoría
  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/categories`,
        categoryData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar categoría
  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/categories/${id}`, 
        categoryData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/categories/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de categorías
  getCategoryStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Verificar si una categoría existe
  checkCategoryExists: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/categories/${id}/exists`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default categoryService;
