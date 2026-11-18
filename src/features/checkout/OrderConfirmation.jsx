import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCRC } from '../cart/formatCurrency';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '../auth/permissions';
import { trackEvent } from '../analytics/analyticsService';
import { formatOrderDate as formatDate } from '../orders/formatOrderDate';
import { DELIVERY_LABELS, DELIVERY_METHODS } from './delivery';
import CommercialTerms from './CommercialTerms';

// Se muestra solo con la orden confirmada; los datos salen de la orden guardada, no del carrito.
//   mode="confirmation": pantalla final de la compra (registra la compra en analytics).
//   mode="detail":       consulta posterior de una orden (Mis órdenes y panel admin);
//                        no vuelve a registrar la compra.
export default function OrderConfirmation({
  order,
  onContinue,
  mode = 'confirmation',
  continueLabel = 'Seguir comprando',
}) {
  const { buyer, delivery } = order;
  const isDetail = mode === 'detail';
  // El último intento de pago es el que dejó la orden confirmada.
  const payment = order.paymentAttempts?.at(-1);
  const { currentUser, can } = useAuth();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isDetail && !trackedRef.current) {
      trackEvent('PURCHASE', { 
        orderNumber: order.orderNumber, 
        total: order.total 
      }, currentUser);
      trackedRef.current = true;
    }
  }, [isDetail, order.orderNumber, order.total, currentUser]);

  return (
    <section className="order-review order-confirmation">
      <div className="order-confirmation__header">
        {/* Icono decorativo: el texto ya comunica la confirmación. */}
        <span className="order-confirmation__icon" aria-hidden="true">✓</span>
        <div>
          {isDetail ? (
            <>
              <h2>Detalle de la orden</h2>
              <p>Orden confirmada el {formatDate(order.date)}.</p>
            </>
          ) : (
            <>
              <h2>¡Compra confirmada!</h2>
              <p>Gracias por su compra, {buyer.fullName}. Su pago fue aprobado.</p>
            </>
          )}
        </div>
      </div>

      <dl className="order-review__data order-confirmation__meta">
        <dt>Número de orden</dt>
        <dd><strong>{order.orderNumber}</strong></dd>
        <dt>Fecha</dt>
        <dd>{formatDate(order.date)}</dd>
        <dt>Transacción</dt>
        <dd>{payment?.transactionId ?? 'No disponible'}</dd>
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
                <th scope="col">Tipo de precio</th>
                <th scope="col">Precio unitario</th>
                <th scope="col">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {/* Los importes ya vienen calculados en la orden guardada. */}
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Producto">{item.name}</td>
                  <td data-label="Cantidad">{item.quantity}</td>
                  <td data-label="Tipo de precio">{item.priceType ?? 'B2C'}</td>
                  <td data-label="Precio unitario">{formatCRC(item.unitPrice)}</td>
                  <td data-label="Subtotal">{formatCRC(item.subtotal)}</td>
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

      {/* Las órdenes guardadas antes de este cambio no tienen usuario */}
      {order.user && <CommercialTerms user={order.user} lines={order.items} />}

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
            {/* Las órdenes viejas no tienen método: se asume envío. */}
            <dt>Método</dt>
            <dd>{DELIVERY_LABELS[delivery.method ?? DELIVERY_METHODS.SHIPPING]}</dd>
            {delivery.branchName && (
              <>
                <dt>Sucursal</dt>
                <dd>{delivery.branchName}</dd>
              </>
            )}
            {delivery.method !== DELIVERY_METHODS.PICKUP && (
              <>
                <dt>Provincia</dt>
                <dd>{delivery.province}</dd>
                <dt>Cantón</dt>
                <dd>{delivery.canton}</dd>
                <dt>Dirección</dt>
                <dd>{delivery.address}</dd>
              </>
            )}
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

      {/* Con sesión de cliente, la orden queda consultable en "Mis órdenes". */}
      {!isDetail && can(PERMISSIONS.VIEW_OWN_ORDERS) && (
        <p className="order-confirmation__orders-link">
          Puede consultar esta orden en <Link to={`/ordenes/${order.orderNumber}`}>Mis órdenes</Link>.
        </p>
      )}

      <button type="button" className="checkout-form__submit" onClick={onContinue}>
        {continueLabel}
      </button>
    </section>
  );
}