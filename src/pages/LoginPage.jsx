import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { fetchUsers } from '../features/auth/authService';
import { trackEvent } from '../features/analytics/analyticsService';
import '../styles/pages/LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
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

  const handleLogin = (user) => {
    login(user);
    trackEvent('LOGIN', { role: user.role }, user);
    navigate(user.role === 'ADMIN' ? '/admin' : '/');
  };

  if (loading) return <div className="login-state">Cargando usuarios desde Algolia...</div>;
  if (error) return <div className="login-state login-state--error">{error}</div>;

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>Selecciona un Usuario</h1>
        <p>Entorno de pruebas B2B / B2C - Proyecto III</p>
      </div>
      
      <div className="login-users-grid">
        {users.map((user) => (
          <button 
            key={user.objectID} 
            className="login-user-card"
            onClick={() => handleLogin(user)}
          >
            <div className="login-user-card__header">
              <h3>{user.name}</h3>
              <span className={`login-user-card__role login-user-card__role--${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </div>
            <p className="login-user-card__email">{user.email}</p>
            {user.company && <p className="login-user-card__company">🏢 {user.company}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}