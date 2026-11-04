import { Link } from 'react-router-dom';

/**
 * Estado vacío de la página del carrito.
 *
 * Se muestra cuando el carrito no tiene líneas; invita a volver al catálogo.
 */
export default function CartEmptyState() {
  return (
    <div className="cart-empty">
      {/* aria-hidden: el emoji es decorativo, no aporta información. */}
      <p className="cart-empty__icon" aria-hidden="true">🛒</p>
      <h2>Tu carrito está vacío</h2>
      <p>Agrega productos desde el catálogo para verlos aquí.</p>
      <Link to="/" className="cart-empty__link">Volver al catálogo</Link>
    </div>
  );
}