/**
 * Mensaje de estado a ancho de página: error inesperado, página no
 * encontrada, etc. Siempre explica qué pasó en lenguaje sencillo y ofrece
 * una acción para continuar, para no dejar al usuario en un callejón sin salida.
 *
 * Props:
 *   icon     emoji decorativo
 *   title    qué pasó, en una frase
 *   children texto con más detalle y cómo seguir
 *   actions  botones o enlaces (nodos React)
 *   tone     'neutral' | 'error'
 */
export default function StatusMessage({ icon, title, children, actions = null, tone = 'neutral' }) {
  return (
    <div className={`status-message status-message--${tone}`}>
      {icon ? (
        <p className="status-message__icon" aria-hidden="true">
          {icon}
        </p>
      ) : null}
      <h2>{title}</h2>
      {children ? <p className="status-message__text">{children}</p> : null}
      {actions ? <div className="status-message__actions">{actions}</div> : null}
    </div>
  );
}
