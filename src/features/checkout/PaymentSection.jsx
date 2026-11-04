import { SANDBOX_SCENARIOS } from '../../services/paymentSandbox';
import { PAYMENT_STATUS } from '../orders/orderModel';
import { formatCRC } from '../cart/formatCurrency';

// Mensajes por cada estado de pago fallido. REFUNDED cubre el caso
// "pago ok, orden no creada" (se devuelve el dinero).
const FAILURES = {
  [PAYMENT_STATUS.DECLINED]: {
    title: 'Pago rechazado',
    text: 'No se realizó ningún cobro. Puede revisar sus datos o intentarlo de nuevo.',
  },
  [PAYMENT_STATUS.ERROR]: {
    title: 'Error del servicio de pagos',
    text: 'No pudimos comunicarnos con el servicio. Su compra no se ha completado; intente de nuevo en unos momentos.',
  },
  // El pago se aprobó, pero la orden no se pudo crear: se devuelve el dinero
  [PAYMENT_STATUS.REFUNDED]: {
    title: 'No se pudo crear su orden',
    text: 'Su pago fue aprobado, pero la orden no pudo completarse. Le devolvimos el dinero (reembolso), así que no se le cobró nada. Puede intentarlo de nuevo.',
  },
};

export function PaymentAlert({ order }) {
  // Si el pago no está en estado fallido, no hay nada que alertar.
  const failure = order && FAILURES[order.paymentStatus];
  if (!failure) return null;

  const lastAttempt = order.paymentAttempts.at(-1);
  const lastOrderAttempt = order.orderAttempts?.at(-1);

  return (
    <div className="payment-alert" role="alert">
      <p className="payment-alert__title">{failure.title}</p>
      <p>{failure.text}</p>
      {/* Motivo del rechazo: viene del último intento de pago. */}
      {order.paymentStatus === PAYMENT_STATUS.DECLINED && lastAttempt?.message && (
        <p>Motivo: {lastAttempt.message}</p>
      )}
      {/* Motivo del reembolso: viene del último intento de crear la orden. */}
      {order.paymentStatus === PAYMENT_STATUS.REFUNDED && lastOrderAttempt?.message && (
        <p>Motivo: {lastOrderAttempt.message}</p>
      )}
      <p className="payment-alert__order">Orden {order.orderNumber}</p>
      <p className="order-states">
        Estado de la orden: <strong>{order.orderStatus}</strong> · Estado del pago:{' '}
        <strong>{order.paymentStatus}</strong>
      </p>
    </div>
  );
}

export default function PaymentSection({ scenario, onScenarioChange, total, order, processing, onPay }) {
  // failed: hay un estado de pago fallido; cambia el texto del botón a "Reintentar".
  const failed = Boolean(order && FAILURES[order.paymentStatus]);

  return (
    <div className="payment-section">
      {/* fieldset disabled: bloquea los radios mientras se procesa el pago. */}
      <fieldset className="sandbox-box" disabled={processing}>
        <legend>Modo Sandbox</legend>
        <p className="sandbox-box__hint">
          Pago simulado para pruebas: elija el resultado que devolverá el servicio. No se usan tarjetas reales.
        </p>
        <div className="sandbox-box__options">
          {SANDBOX_SCENARIOS.map((option) => (
            <label key={option.value} className="sandbox-box__option">
              <input
                type="radio"
                name="sandbox-scenario"
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
        onClick={onPay}
        disabled={processing}
        aria-busy={processing}
      >
        {/* Tres estados del botón: procesando > reintento > pago inicial. */}
        {processing ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Procesando pago...
          </>
        ) : failed ? (
          'Reintentar pago'
        ) : (
          `Pagar ${formatCRC(total)}`
        )}
      </button>
    </div>
  );
}