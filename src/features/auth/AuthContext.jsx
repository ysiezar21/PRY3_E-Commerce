/**
 * Contexto de Autenticación (simulada).
 *
 * Provee el usuario actual (currentUser), login, logout y can() para
 * consultar permisos. La sesión se persiste en localStorage.
 * Solo se aceptan usuarios con un rol válido: una sesión guardada dañada o
 * con un rol desconocido se descarta.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { isValidUser, isValidRole, can as userCan } from './permissions';

const AuthContext = createContext();

const STORAGE_KEY = 'techgrid_user';

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return isValidUser(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Inicializa el estado leyendo de localStorage si existe
  const [currentUser, setCurrentUser] = useState(loadSession);

  // Guarda en localStorage cada vez que cambia el usuario
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUser]);

  // Inicia sesión (sin contraseña, solo simulación).
  // Devuelve { ok, message } para que la pantalla de login explique el rechazo.
  const login = (user) => {
    if (!user || !user.objectID || !user.name) {
      return { ok: false, message: 'El usuario no existe o sus datos están incompletos.' };
    }
    if (!isValidRole(user.role)) {
      return {
        ok: false,
        message: `El usuario "${user.name}" no tiene un rol válido asignado, por lo que no puede ingresar.`,
      };
    }
    setCurrentUser(user);
    return { ok: true, message: '' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Atajo para consultar un permiso del usuario actual: can(PERMISSIONS.X)
  const can = (permission) => userCan(currentUser, permission);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, can }}>
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
