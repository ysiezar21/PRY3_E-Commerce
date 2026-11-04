import { Link } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { getCartSummary } from '../features/cart/cartCalculations';
import CartLineItem from '../features/cart/CartLineItem';
import CartSummary from '../features/cart/CartSummary';
import CartEmptyState from '../features/cart/CartEmptyState';

/**
 * Página del carrito.
 *
 * Lista las líneas del carrito, muestra el resumen de importes y enlaza
 * al checkout. Si el carrito está vacío, delega en CartEmptyState.
 */
export default function CartPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  // Los importes se derivan aquí una sola vez y se pasan a CartSummary.
  const { subtotal, iva, shipping, total } = getCartSummary(items);

  return (
    <div className="cart-page">
      <div className="cart-page__header">
        <h1>Tu carrito</h1>
        {/* window.history.back() en vez de Link para respetar la navegación previa. */}
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

        {/* children de CartSummary: CTA al checkout bajo el resumen. */}
        <CartSummary subtotal={subtotal} iva={iva} shipping={shipping} total={total}>
          <Link to="/checkout" className="cart-summary__checkout">
            Proceder al pago
          </Link>
        </CartSummary>
      </div>
    </div>
  );
}