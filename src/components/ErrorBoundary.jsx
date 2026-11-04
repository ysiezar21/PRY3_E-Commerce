/**
 * Red de seguridad para errores inesperados.
 *
 * Si algún componente falla al dibujarse, React desmonta toda la aplicación
 * y el usuario ve una pantalla en blanco. Este componente atrapa ese error y
 * muestra un mensaje comprensible, con opciones para continuar.
 *
 * Uso:
 *   <ErrorBoundary resetKey={pathname}>  ...contenido...  </ErrorBoundary>
 *
 * - resetKey: cuando cambia (por ejemplo, al navegar a otra ruta) el error
 *   se limpia solo, así un fallo en una página no bloquea las demás.
 *
 * Limitación de React: los error boundaries NO atrapan errores dentro de
 * manejadores de eventos (onClick) ni de código asíncrono (fetch, setTimeout).
 * Esos casos se manejan con try/catch donde ocurren (ver payOrder.js).
 */
import { Component } from 'react';
import StatusMessage from './StatusMessage';

export default class ErrorBoundary extends Component {
  state = { error: null };

  // React llama a este método cuando un hijo lanza un error al dibujarse.
  static getDerivedStateFromError(error) {
    return { error };
  }

  // El detalle técnico va a la consola, nunca a la pantalla del usuario.
  componentDidCatch(error, info) {
    console.error('Error inesperado en la aplicación:', error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

      return (
      <StatusMessage
        icon=":("
        tone="error"
        title="Ups, algo salió mal"
        actions={
          <>
            <button type="button" className="status-message__button" onClick={this.reset}>
              Intentar de nuevo
            </button>
            {/* Enlace normal (no <Link>): funciona aunque el error esté en el router */}
            <a href="#/" className="status-message__button status-message__button--secondary">
              Volver al catálogo
            </a>
          </>
        }
      >
        Ocurrió un problema inesperado y no pudimos mostrar esta página. Tu carrito no se perdió.
        Puedes intentar de nuevo o volver al catálogo. Nuestros productos no tienen problemas como
        este, no te preocupes :)
       
      </StatusMessage>
    );
  }
}
