/**
 * Guard de rutas: solo muestra el contenido si el usuario actual tiene el
 * permiso indicado. Sin sesión lleva al inicio de sesión; con sesión pero
 * sin el permiso, deniega el acceso con un mensaje claro.
 */
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getRoleInfo } from './permissions';
import StatusMessage from '../../components/StatusMessage';

// permission puede ser un permiso o una lista: con una lista basta con tener uno.
export default function RequirePermission({ permission, area = 'esta sección', children }) {
  const { currentUser, can } = useAuth();

  const allowed = Array.isArray(permission) ? permission.some((item) => can(item)) : can(permission);
  if (allowed) return children;

  // Sin sesión: directo al inicio de sesión, sin página de error.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <StatusMessage
      tone="error"
      title="Acceso denegado"
      actions={
        <Link to="/" className="status-message__button">
          Volver al catálogo
        </Link>
      }
    >
      Su usuario ({currentUser.name}, rol {getRoleInfo(currentUser).label}) no tiene permiso para
      entrar a {area}.
    </StatusMessage>
  );
}
