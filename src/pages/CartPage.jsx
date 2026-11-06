import { Link } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { getCartSummary } from '../features/cart/cartCalculations';
import CartLineItem from '../features/cart/CartLineItem';
import CartSummary from '../features/cart/CartSummary';
import CartEmptyState from '../features/cart/CartEmptyState';
import BranchSelector from '../features/branches/BranchSelector';

/**
 * Página del carrito.
 *
 * Lista las líneas del carrito, permite elegir la sucursal de retiro
 * o entrega, muestra el resumen de importes y enlaza al checkout.
 *
 * El checkout se bloquea si:
 *   - No hay sucursal elegida.
 *   - Algún producto no cumple con el mínimo B2B en esa sucursal.
 */
export default function CartPage() {
  const { items, branchId, setBranch } = useCart();

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const { subtotal, iva, shipping, total } = getCartSummary(items);

  // Productos que no pueden cumplir el mínimo en la sucursal elegida.
  const branchIssues = branchId
    ? items.filter(
        (item) => (item.multi_sede?.[branchId] ?? 0) < (item.minimumOrder || 1)
      )
    : [];

  const canCheckout = Boolean(branchId) && branchIssues.length === 0;

  // Texto dinámico del botón según el motivo del bloqueo.
  const checkoutLabel = !branchId
    ? 'Seleccione una sucursal'
    : branchIssues.length > 0
    ? 'Ajuste cantidades'
    : 'Proceder al pago';

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Tu carrito</h1>
        <button className="back-button" onClick={() => window.history.back()}>
          ← Seguir comprando
        </button>
      </div>

      <BranchSelector items={items} value={branchId} onChange={setBranch} />

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
            {checkoutLabel}
          </Link>
          {branchIssues.length > 0 && (
            <p className="cart-summary__warn">
              Ajuste las cantidades de los productos marcados en rojo para continuar.
            </p>
          )}
        </CartSummary>
      </div>
    </div>
  );
}