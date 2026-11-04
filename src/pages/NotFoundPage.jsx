/**
 * Página 404: se muestra cuando la dirección no coincide con ninguna ruta
 * (por ejemplo "#/ruta-que-no-existe"), en lugar de dejar la pantalla en blanco.
 */
import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage';

export default function NotFoundPage() {
  return (
    <StatusMessage
      icon=":("
      title="Página no encontrada"
      actions={
        <>
          <Link to="/" className="status-message__button">
            Ir al catálogo
          </Link>
          <Link to="/carrito" className="status-message__button status-message__button--secondary">
            Ver mi carrito
          </Link>
        </>
      }
    >
      La dirección que buscas no existe. Puedes volver al catálogo para seguir comprando.
    </StatusMessage>
  );
}