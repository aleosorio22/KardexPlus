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

const setupService = {
  // Verificar estado de los permisos
  checkPermissionsStatus: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/setup/check-permissions-status`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Configurar permisos básicos
  setupPermissions: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/setup/setup-permissions`, {}, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Asignar permisos a un rol específico
  assignPermissionsToRole: async (roleName, permissions) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/setup/assign-permissions/${roleName}`, 
        { permissions }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default setupService;
