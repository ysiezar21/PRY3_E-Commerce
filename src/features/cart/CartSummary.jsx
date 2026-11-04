import { formatCRC } from './formatCurrency';

/**
 * Resumen de compra reutilizable (carrito y checkout).
 *
 * Recibe los importes ya calculados y los muestra formateados en CRC.
 * `children` permite añadir CTAs debajo (botón de pagar, seguir comprando, etc.).
 */
export default function CartSummary({ subtotal, iva, shipping, total, children }) {
  return (
    <aside className="cart-summary">
      <h2>Resumen de compra</h2>
      <dl className="cart-summary__rows">
        <div className="cart-summary__row">
          <dt>Subtotal</dt>
          <dd>{formatCRC(subtotal)}</dd>
        </div>
        <div className="cart-summary__row">
          <dt>IVA (13%)</dt>
          <dd>{formatCRC(iva)}</dd>
        </div>
        <div className="cart-summary__row">
          <dt>Envío</dt>
          {/* Envío gratis se muestra como texto, no como ₡0. */}
          <dd>{shipping === 0 ? 'Gratis' : formatCRC(shipping)}</dd>
        </div>
        <div className="cart-summary__row cart-summary__row--total">
          <dt>Total</dt>
          <dd>{formatCRC(total)}</dd>
        </div>
      </dl>
      {children}
    </aside>
  );
}