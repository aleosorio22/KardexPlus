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

const roleService = {
  // Obtener todos los roles
  getAllRoles: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener un rol por ID
  getRoleById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Crear un nuevo rol
  createRole: async (roleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/roles`, roleData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Actualizar un rol
  updateRole: async (id, roleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/roles/${id}`, roleData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Eliminar un rol
  deleteRole: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/roles/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Obtener permisos de un rol
  getRolePermissions: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/roles/${id}/permissions`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Asignar permisos a un rol
  assignRolePermissions: async (id, permissionIds) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/roles/${id}/permissions`, 
        { permissionIds }, 
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  }
};

export default roleService;
