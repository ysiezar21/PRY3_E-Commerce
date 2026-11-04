import { ORDER_SCENARIOS, ORDER_RESULTS } from '../../services/orderSandbox';
import { formatCRC } from '../cart/formatCurrency';

// Pantalla intermedia: el pago ya fue aprobado y falta crear la orden.
// Tiene su propio menú Sandbox para simular el resultado del servicio de órdenes.
// Aquí nunca se cobra: si la creación falla, el reintento no vuelve a pedir el pago.
export default function OrderStep({ order, scenario, onScenarioChange, processing, onCreate }) {
  // lastOrderAttempt: último intento de crear la orden (para detectar fallo previo).
  // payment: último intento de pago, ya aprobado (de ahí sale el transactionId).
  const lastOrderAttempt = order.orderAttempts?.at(-1);
  const failedBefore = lastOrderAttempt?.status === ORDER_RESULTS.ERROR;
  const payment = order.paymentAttempts.at(-1);

  return (
    <section className="order-review order-confirmation order-step">
      <div className="order-confirmation__header">
        {/* Icono decorativo: el título ya comunica el estado. */}
        <span className="order-confirmation__icon" aria-hidden="true">✓</span>
        <div>
          <h2>Pago aprobado</h2>
          <p>Recibimos su pago de {formatCRC(order.total)}. Solo falta crear su orden.</p>
        </div>
      </div>

      {/* Solo se muestra si un intento anterior falló y no se está reintentando. */}
      {failedBefore && !processing && (
        <div className="payment-alert" role="alert">
          <p className="payment-alert__title">Error del servicio de órdenes</p>
          <p>
            No pudimos crear su orden en este momento. Su pago ya fue aprobado y no se le cobrará de
            nuevo. Intente crearla otra vez.
          </p>
        </div>
      )}

      <dl className="order-review__data order-confirmation__meta">
        <dt>Número de orden</dt>
        <dd><strong>{order.orderNumber}</strong></dd>
        <dt>Transacción</dt>
        <dd>{payment.transactionId}</dd>
      </dl>

      <p className="order-states">
        Estado de la orden: <strong>{order.orderStatus}</strong> · Estado del pago:{' '}
        <strong>{order.paymentStatus}</strong>
      </p>

      <div className="payment-section">
        {/* fieldset disabled: bloquea los radios mientras se crea la orden. */}
        <fieldset className="sandbox-box" disabled={processing}>
          <legend>Modo Sandbox</legend>
          <p className="sandbox-box__hint">
            Creación de la orden simulada: elija el resultado que devolverá el servicio de órdenes.
          </p>
          <div className="sandbox-box__options">
            {ORDER_SCENARIOS.map((option) => (
              <label key={option.value} className="sandbox-box__option">
                <input
                  type="radio"
                  name="sandbox-order-scenario"
                  value={option.value}
                  checked={scenario === option.value}
                  onChange={(e) => onScenarioChange(e.target.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* aria-busy avisa a lectores de pantalla de que hay una operación en curso. */}
        <button
          type="button"
          className="checkout-form__submit payment-section__pay"
          onClick={onCreate}
          disabled={processing}
          aria-busy={processing}
        >
          {/* Tres estados del botón: creando > reintento > acción inicial. */}
          {processing ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Creando orden...
            </>
          ) : failedBefore ? (
            'Reintentar crear orden'
          ) : (
            'Crear orden'
          )}
        </button>
      </div>
    </section>
  );
}