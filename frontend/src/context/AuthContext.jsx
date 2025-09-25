import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3499/api';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const authData = {
        token,
        user: JSON.parse(userData)
      };
      setAuth(authData);
      // Configuramos el token para todas las futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, credentials);
      const { token, user } = response.data.data;
      
      // Guardamos tanto el token como los datos del usuario
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      setAuth({
        token,
        user
      });
      
      // Configuramos el token para todas las futuras peticiones
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete axios.defaults.headers.common['Authorization'];
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
