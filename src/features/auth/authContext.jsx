/**
 * Contexto de Autenticación.
 * 
 * Provee el estado del usuario actual (currentUser), la función para
 * iniciar sesión (login) y para cerrar sesión (logout).
 * La sesión se persiste en localStorage.
 */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Inicializa el estado leyendo de localStorage si existe
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('techgrid_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Guarda en localStorage cada vez que cambia el usuario
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('techgrid_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('techgrid_user');
    }
  }, [currentUser]);

  // Inicia sesión (sin contraseña, solo simulación)
  const login = (user) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}