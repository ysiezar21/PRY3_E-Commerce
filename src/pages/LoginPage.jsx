import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { fetchUsers } from '../features/auth/authService';
import { isValidRole, getRoleInfo } from '../features/auth/permissions';
import { trackEvent } from '../features/analytics/analyticsService';
import '../styles/pages/LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    fetchUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  // Motivo por el que se rechazó el último intento de inicio de sesión.
  const [loginError, setLoginError] = useState('');

  const handleLogin = (user) => {
    // login() rechaza usuarios incompletos o sin un rol válido.
    const result = login(user);
    if (!result.ok) {
      setLoginError(result.message);
      return;
    }
    setLoginError('');
    trackEvent('LOGIN', { role: user.role }, user);
    // El admin va a su panel; los clientes vuelven a donde estaban (carrito o checkout).
    navigate(user.role === 'ADMIN' ? '/admin' : (location.state?.from ?? '/'));
  };

  if (loading) return <div className="login-state">Cargando usuarios desde Algolia...</div>;
  if (error) return <div className="login-state login-state--error">{error}</div>;

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>Selecciona un Usuario</h1>
        <p>Entorno de pruebas B2B / B2C - Proyecto III</p>
      </div>
      
      {loginError && (
        <p className="login-error" role="alert">
          No se pudo iniciar sesión. {loginError}
        </p>
      )}

      {users.length === 0 && (
        <p className="login-error" role="alert">
          No hay usuarios disponibles para iniciar sesión.
        </p>
      )}

      <div className="login-users-grid">
        {users.map((user) => (
          <button
            key={user.objectID}
            className="login-user-card"
            onClick={() => handleLogin(user)}
          >
            <div className="login-user-card__header">
              <h3>{user.name ?? 'Usuario sin nombre'}</h3>
              {isValidRole(user.role) ? (
                <span className={`login-user-card__role login-user-card__role--${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              ) : (
                <span className="login-user-card__role login-user-card__role--invalid">
                  Rol no válido
                </span>
              )}
            </div>
            {isValidRole(user.role) && (
              <p className="login-user-card__type">{getRoleInfo(user).userType}</p>
            )}
            <p className="login-user-card__email">{user.email}</p>
            {user.company && <p className="login-user-card__company">{user.company}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}