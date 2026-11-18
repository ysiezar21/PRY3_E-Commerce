/**
 * Guard de rutas: solo muestra el contenido si el usuario actual tiene el
 * permiso indicado. Sin sesión invita a iniciarla; con sesión pero sin el
 * permiso, deniega el acceso con un mensaje claro.
 */
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getRoleInfo } from './permissions';
import StatusMessage from '../../components/StatusMessage';

export default function RequirePermission({ permission, area = 'esta sección', children }) {
  const { currentUser, can } = useAuth();

  if (can(permission)) return children;

  if (!currentUser) {
    return (
      <StatusMessage
        icon="🔒"
        title="Inicie sesión para continuar"
        actions={
          <>
            <Link to="/login" className="status-message__button">
              Iniciar sesión
            </Link>
            <Link to="/" className="status-message__button status-message__button--secondary">
              Ir al catálogo
            </Link>
          </>
        }
      >
        Necesita iniciar sesión con un usuario autorizado para entrar a {area}.
      </StatusMessage>
    );
  }

  return (
    <StatusMessage
      icon="⛔"
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
