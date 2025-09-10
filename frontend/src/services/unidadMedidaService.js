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

// Obtener todas las unidades de medida
export const getUnidadesMedida = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unidades-medida`, getAuthHeaders());
    return response.data.data || [];
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Obtener unidades de medida con paginación y filtros
export const getUnidadesMedidaWithPagination = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros de filtro si existen
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/unidades-medida/paginated${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Obtener una unidad de medida por ID
export const getUnidadMedidaById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/unidades-medida/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Crear unidad de medida
export const createUnidadMedida = async (unidadData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/unidades-medida`,
      unidadData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Actualizar unidad de medida
export const updateUnidadMedida = async (id, unidadData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/unidades-medida/${id}`, 
      unidadData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Eliminar unidad de medida
export const deleteUnidadMedida = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/unidades-medida/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Obtener estadísticas de unidades de medida
export const getUnidadMedidaStats = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/unidades-medida/stats`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// Verificar si una unidad de medida existe
export const checkUnidadMedidaExists = async (id) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/unidades-medida/${id}/exists`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const unidadMedidaService = {
  getUnidadesMedida,
  getUnidadesMedidaWithPagination,
  getUnidadMedidaById,
  createUnidadMedida,
  updateUnidadMedida,
  deleteUnidadMedida,
  getUnidadMedidaStats,
  checkUnidadMedidaExists
};

export default unidadMedidaService;
