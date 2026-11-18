import { Link } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import { getCartSummary, validateB2BConditions } from '../features/cart/cartCalculations';
import CartLineItem from '../features/cart/CartLineItem';
import CartSummary from '../features/cart/CartSummary';
import CartEmptyState from '../features/cart/CartEmptyState';

/**
 * Página del carrito.
 *
 * Lista las líneas del carrito, muestra el resumen de importes y enlaza al
 * checkout, donde se eligen el método de entrega y la sucursal.
 *
 * El checkout se bloquea si:
 *   - Alguna cantidad está por debajo del mínimo B2B.
 *   - La sucursal ya elegida no alcanza el mínimo de algún producto.
 */
export default function CartPage() {
  const { items, branchId } = useCart();
  const { currentUser } = useAuth();

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const { subtotal, iva, shipping, total } = getCartSummary(items);

  // Productos que no alcanzan el mínimo en la sucursal elegida (si ya hay una).
  const branchIssues = branchId
    ? items.filter(
        (item) => (item.multi_sede?.[branchId] ?? 0) < (item.minimumOrder || 1)
      )
    : [];

  // Pedido mínimo B2B.
  const b2bCheck = validateB2BConditions(items);

  const canCheckout = branchIssues.length === 0 && b2bCheck.isValid;

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Tu carrito</h1>
        <button className="back-button" onClick={() => window.history.back()}>
          ← Seguir comprando
        </button>
      </div>

      <div className="cart-page__content">
        <ul className="cart-line-list">
          {items.map((item) => (
            <CartLineItem key={item.id} item={item} />
          ))}
        </ul>

        <CartSummary subtotal={subtotal} iva={iva} shipping={shipping} total={total}>
          <Link
            to={canCheckout ? '/checkout' : '#'}
            onClick={(e) => {
              if (!canCheckout) e.preventDefault();
            }}
            className={`cart-summary__checkout ${!canCheckout ? 'is-disabled' : ''}`}
            aria-disabled={!canCheckout}
          >
            {canCheckout ? 'Proceder al pago' : 'Ajuste cantidades'}
          </Link>
          {branchIssues.length > 0 && (
            <p className="cart-summary__warn">
              Ajuste las cantidades de los productos marcados en rojo para continuar.
            </p>
          )}
          {!b2bCheck.isValid && (
            <p className="cart-summary__warn">{b2bCheck.message}</p>
          )}

          {/* Invitación para invitados; no bloquea la compra */}
          {!currentUser && (
            <p className="cart-summary__hint">
              ¿Compra para su empresa?{' '}
              <Link to="/login" state={{ from: '/carrito' }}>
                Inicie sesión
              </Link>{' '}
              para ver precios mayoristas.
            </p>
          )}
        </CartSummary>
      </div>
    </div>
  );
}
