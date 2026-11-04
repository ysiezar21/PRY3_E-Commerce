import { getLineSubtotal } from '../cart/cartCalculations';
import { formatCRC } from '../cart/formatCurrency';

// Resumen final de la compra: productos, datos del comprador y entrega, y totales.
// Los valores vienen del carrito, aquí no se recalcula nada.
export default function OrderReview({ items, buyer, summary, onEdit, editDisabled, children }) {
  const { subtotal, iva, shipping, total } = summary;

  return (
    <section className="order-review">
      {/* Volver al formulario; se deshabilita mientras se procesa el pago. */}
      <button className="back-button" onClick={onEdit} disabled={editDisabled}>
        ← Editar datos
      </button>

      <h2>Revisión de la compra</h2>

      <div className="order-review__block">
        <h3>Productos</h3>
        <div className="order-review__table-wrapper">
          <table className="order-review__table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Precio unitario</th>
                <th scope="col">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {/* El subtotal por línea se deriva; el carrito no lo guarda. */}
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCRC(item.price)}</td>
                  <td>{formatCRC(getLineSubtotal(item))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="order-review__block">
        <h3>Totales</h3>
        <dl className="order-review__totals">
          <div className="order-review__row">
            <dt>Subtotal</dt>
            <dd>{formatCRC(subtotal)}</dd>
          </div>
          <div className="order-review__row">
            <dt>IVA (13%)</dt>
            <dd>{formatCRC(iva)}</dd>
          </div>
          <div className="order-review__row">
            <dt>Envío</dt>
            {/* Envío gratis se muestra como texto, no como ₡0. */}
            <dd>{shipping === 0 ? 'Gratis' : formatCRC(shipping)}</dd>
          </div>
          <div className="order-review__row order-review__row--total">
            <dt>Total</dt>
            <dd>{formatCRC(total)}</dd>
          </div>
        </dl>
      </div>

      <div className="order-review__columns">
        <div className="order-review__block">
          <h3>Comprador</h3>
          <dl className="order-review__data">
            {/* trim() por si el usuario dejó espacios al escribir. */}
            <dt>Nombre</dt>
            <dd>{buyer.fullName.trim()}</dd>
            <dt>Correo</dt>
            <dd>{buyer.email.trim()}</dd>
            <dt>Teléfono</dt>
            <dd>{buyer.phone.trim()}</dd>
          </dl>
        </div>

        <div className="order-review__block">
          <h3>Entrega</h3>
          <dl className="order-review__data">
            <dt>Provincia</dt>
            <dd>{buyer.province}</dd>
            <dt>Cantón</dt>
            <dd>{buyer.canton}</dd>
            <dt>Dirección</dt>
            <dd>{buyer.address.trim()}</dd>
            {/* Las indicaciones son opcionales: solo se muestran si hay texto. */}
            {buyer.notes.trim() && (
              <>
                <dt>Indicaciones</dt>
                <dd>{buyer.notes.trim()}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* children permite añadir el bloque de pago bajo la revisión. */}
      {children}
    </section>
  );
}