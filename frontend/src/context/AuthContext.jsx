import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí verificaremos si hay un token guardado
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí validaremos el token con el backend
      // Por ahora solo simulamos que está autenticado
      setAuth(null); // Cambiar por lógica real
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setAuth(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(null);
  };

  const value = {
    auth,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
