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

  updateUser: async (id, userData) => {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
  }
};

export default userService;
