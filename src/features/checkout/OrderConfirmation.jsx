import { formatCRC } from '../cart/formatCurrency';

// Fecha larga con hora, en formato costarricense (ej. "16 de octubre de 2026, 14:30").
const formatDate = (iso) =>
  new Intl.DateTimeFormat('es-CR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));

// Se muestra solo con la orden confirmada; los datos salen de la orden guardada, no del carrito
export default function OrderConfirmation({ order, onContinue }) {
  const { buyer, delivery } = order;
  // El último intento de pago es el que dejó la orden confirmada.
  const payment = order.paymentAttempts.at(-1);

  return (
    <section className="order-review order-confirmation">
      <div className="order-confirmation__header">
        {/* Icono decorativo: el texto ya comunica la confirmación. */}
        <span className="order-confirmation__icon" aria-hidden="true">✓</span>
        <div>
          <h2>¡Compra confirmada!</h2>
          <p>Gracias por su compra, {buyer.fullName}. Su pago fue aprobado.</p>
        </div>
      </div>

      <dl className="order-review__data order-confirmation__meta">
        <dt>Número de orden</dt>
        <dd><strong>{order.orderNumber}</strong></dd>
        <dt>Fecha</dt>
        <dd>{formatDate(order.date)}</dd>
        <dt>Transacción</dt>
        <dd>{payment.transactionId}</dd>
      </dl>

      <p className="order-states">
        Estado de la orden: <strong>{order.orderStatus}</strong> · Estado del pago:{' '}
        <strong>{order.paymentStatus}</strong>
      </p>

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
              {/* Los importes ya vienen calculados en la orden guardada. */}
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCRC(item.unitPrice)}</td>
                  <td>{formatCRC(item.subtotal)}</td>
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
            <dd>{formatCRC(order.subtotal)}</dd>
          </div>
          <div className="order-review__row">
            <dt>IVA (13%)</dt>
            <dd>{formatCRC(order.iva)}</dd>
          </div>
          <div className="order-review__row">
            <dt>Envío</dt>
            {/* Envío gratis se muestra como texto, no como ₡0. */}
            <dd>{order.shippingCost === 0 ? 'Gratis' : formatCRC(order.shippingCost)}</dd>
          </div>
          <div className="order-review__row order-review__row--total">
            <dt>Total pagado</dt>
            <dd>{formatCRC(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="order-review__columns">
        <div className="order-review__block">
          <h3>Comprador</h3>
          <dl className="order-review__data">
            <dt>Nombre</dt>
            <dd>{buyer.fullName}</dd>
            <dt>Correo</dt>
            <dd>{buyer.email}</dd>
            <dt>Teléfono</dt>
            <dd>{buyer.phone}</dd>
          </dl>
        </div>

        <div className="order-review__block">
          <h3>Entrega</h3>
          <dl className="order-review__data">
            <dt>Provincia</dt>
            <dd>{delivery.province}</dd>
            <dt>Cantón</dt>
            <dd>{delivery.canton}</dd>
            <dt>Dirección</dt>
            <dd>{delivery.address}</dd>
            {/* Las indicaciones son opcionales: solo se muestran si existen. */}
            {delivery.notes && (
              <>
                <dt>Indicaciones</dt>
                <dd>{delivery.notes}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <button type="button" className="checkout-form__submit" onClick={onContinue}>
        Seguir comprando
      </button>
    </section>
  );
}