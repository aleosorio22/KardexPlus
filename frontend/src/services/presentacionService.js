const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class PresentacionService {
  // Obtener todas las presentaciones
  async getAllPresentaciones() {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener presentaciones');
      }

      return data;
    } catch (error) {
      console.error('Error en getAllPresentaciones:', error);
      throw error;
    }
  }

  // Obtener presentación por ID
  async getPresentacionById(id) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener presentación');
      }

      return data;
    } catch (error) {
      console.error('Error en getPresentacionById:', error);
      throw error;
    }
  }

  // Obtener presentaciones por unidad de medida
  async getPresentacionesByUnidadMedida(unidadMedidaId) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/unidad-medida/${unidadMedidaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener presentaciones por unidad de medida');
      }

      return data;
    } catch (error) {
      console.error('Error en getPresentacionesByUnidadMedida:', error);
      throw error;
    }
  }

  // Crear nueva presentación
  async createPresentacion(presentacionData) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presentacionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear presentación');
      }

      return data;
    } catch (error) {
      console.error('Error en createPresentacion:', error);
      throw error;
    }
  }

  // Actualizar presentación
  async updatePresentacion(id, presentacionData) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(presentacionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar presentación');
      }

      return data;
    } catch (error) {
      console.error('Error en updatePresentacion:', error);
      throw error;
    }
  }

  // Eliminar presentación
  async deletePresentacion(id) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar presentación');
      }

      return data;
    } catch (error) {
      console.error('Error en deletePresentacion:', error);
      throw error;
    }
  }

  // Obtener estadísticas de presentaciones
  async getPresentacionStats() {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }

      return data;
    } catch (error) {
      console.error('Error en getPresentacionStats:', error);
      throw error;
    }
  }

  // Buscar presentaciones
  async searchPresentaciones(searchTerm) {
    try {
      const response = await fetch(`${API_URL}/api/presentaciones/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar presentaciones');
      }

      return data;
    } catch (error) {
      console.error('Error en searchPresentaciones:', error);
      throw error;
    }
  }

  // Obtener todas las unidades de medida (para los selectores)
  async getAllUnidadesMedida() {
    try {
      const response = await fetch(`${API_URL}/api/unidades-medida`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener unidades de medida');
      }

      return data;
    } catch (error) {
      console.error('Error en getAllUnidadesMedida:', error);
      throw error;
    }
  }
}

// Exportar una instancia del servicio
const presentacionService = new PresentacionService();
export default presentacionService;
