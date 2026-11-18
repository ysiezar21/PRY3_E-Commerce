import { Link } from 'react-router-dom';

/**
 * Estado vacío de la página del carrito.
 *
 * Se muestra cuando el carrito no tiene líneas; invita a volver al catálogo.
 */
export default function CartEmptyState() {
  return (
    <div className="cart-empty">
      {/* Ícono decorativo: el mismo carrito del encabezado. */}
      <p className="cart-empty__icon" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </p>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega productos desde el catálogo para verlos aquí.</p>
      <Link to="/" className="cart-empty__link">Volver al catálogo</Link>
    </div>
  );
}