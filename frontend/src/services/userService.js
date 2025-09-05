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

const userService = {
  // Obtener todos los usuarios con filtros y paginación
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de filtro si existen
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${API_BASE_URL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener un usuario por ID
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear usuario
  createUser: async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        userData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${id}`, 
        userData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cambiar estado del usuario (activar/desactivar)
  toggleUserStatus: async (id) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/${id}/toggle-status`, 
        {}, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Cambiar contraseña
  changePassword: async (id, passwordData) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/users/${id}/password`, 
        passwordData, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener usuarios disponibles (para asignación de roles)
  getAvailableUsers: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/available`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener estadísticas de usuarios
  getUserStats: async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/stats`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default userService;
