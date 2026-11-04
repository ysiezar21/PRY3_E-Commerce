import { getLineSubtotal } from '../cart/cartCalculations';
import { PAYMENT_RESULTS } from '../../services/paymentSandbox';
import { ORDER_RESULTS } from '../../services/orderSandbox';

// Estado de la orden y estado del pago son cosas distintas:
// la orden dice si la compra quedó cerrada, el pago dice qué pasó con el cobro.
//
// Combinaciones posibles:
//   PENDING   + PENDING   → se está procesando el pago
//   FAILED    + DECLINED  → el servicio rechazó el pago (se puede reintentar)
//   PENDING   + ERROR     → el servicio de pagos falló (se puede reintentar)
//   PENDING   + APPROVED  → pago aprobado, falta crear la orden
//   CONFIRMED + APPROVED  → compra exitosa
//   FAILED    + REFUNDED  → el pago se aprobó, pero la orden no se pudo crear:
//                           se devuelve el dinero
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  ERROR: 'ERROR',
  REFUNDED: 'REFUNDED',
};

// Se registra en el historial de pagos cuando se devuelve el dinero
const REFUND_STATUS = 'PAYMENT_REFUNDED';

export const CURRENCY = 'CRC';

// Evita errores de decimales al multiplicar
const roundMoney = (value) => Math.round(value * 100) / 100;

// Sin letras ni números que se confundan entre sí (0/O, 1/I)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// Formato: ORD-20261012-A7K2Q9
export function generateOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }

  return `ORD-${year}${month}${day}-${code}`;
}

// Construye la orden con una copia de los datos del carrito y del formulario.
// Nace pendiente: el estado cambia cuando llega el resultado del pago.
export function createOrder({ buyer, items, summary }) {
  const now = new Date();

  return {
    orderNumber: generateOrderNumber(now),
    date: now.toISOString(),
    currency: CURRENCY,
    buyer: {
      fullName: buyer.fullName.trim(),
      email: buyer.email.trim(),
      phone: buyer.phone.trim(),
    },
    delivery: {
      province: buyer.province,
      canton: buyer.canton,
      address: buyer.address.trim(),
      notes: buyer.notes.trim(),
    },
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: roundMoney(getLineSubtotal(item)),
    })),
    subtotal: roundMoney(summary.subtotal),
    iva: roundMoney(summary.iva),
    shippingCost: roundMoney(summary.shipping),
    total: roundMoney(summary.total),
    orderStatus: ORDER_STATUS.PENDING,
    paymentStatus: PAYMENT_STATUS.PENDING,
    termsAccepted: {
      accepted: buyer.acceptTerms === true,
      acceptedAt: now.toISOString(),
      version: '1.0',
    },
    paymentAttempts: [],
    orderAttempts: [],
  };
}

export function startPayment(order) {
  return { ...order, orderStatus: ORDER_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.PENDING };
}

// Pago aprobado, pero la orden todavía no se ha creado.
// En este punto ya se cobró, así que la orden no se puede abandonar.
export function isAwaitingOrder(order) {
  return (
    Boolean(order) &&
    order.paymentStatus === PAYMENT_STATUS.APPROVED &&
    order.orderStatus === ORDER_STATUS.PENDING
  );
}

// Orden que el usuario dejó sin pagar para crear otra
export function abandonOrder(order) {
  if (isAwaitingOrder(order)) return order;
  return { ...order, orderStatus: ORDER_STATUS.FAILED };
}

// Un pago aprobado NO confirma la orden por sí solo: queda pendiente hasta que el
// servicio de órdenes responda (ver applyOrderResult).
// Si el servicio de pagos falla, la orden sigue pendiente porque no hubo respuesta del cobro.
export function applyPaymentResult(order, response) {
  const attempt = {
    transactionId: response.transactionId ?? null,
    status: response.status,
    message: response.message,
    timestamp: response.timestamp ?? new Date().toISOString(),
  };
  const updated = { ...order, paymentAttempts: [...order.paymentAttempts, attempt] };

  if (response.status === PAYMENT_RESULTS.APPROVED) {
    return { ...updated, orderStatus: ORDER_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.APPROVED };
  }
  if (response.status === PAYMENT_RESULTS.DECLINED) {
    return { ...updated, orderStatus: ORDER_STATUS.FAILED, paymentStatus: PAYMENT_STATUS.DECLINED };
  }
  return { ...updated, orderStatus: ORDER_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.ERROR };
}

// Resultado del servicio de órdenes, que solo se consulta con el pago aprobado:
//   - confirmada: la compra queda cerrada.
//   - rechazada: la orden falla y se devuelve el dinero (el pago pasa a REFUNDED).
//   - error del servicio: sigue pendiente; se reintenta SIN volver a cobrar.
export function applyOrderResult(order, response) {
  const timestamp = response.timestamp ?? new Date().toISOString();
  const attempt = { status: response.status, message: response.message, timestamp };
  const updated = { ...order, orderAttempts: [...(order.orderAttempts ?? []), attempt] };

  if (response.status === ORDER_RESULTS.CONFIRMED) {
    return { ...updated, orderStatus: ORDER_STATUS.CONFIRMED, paymentStatus: PAYMENT_STATUS.APPROVED };
  }
  if (response.status === ORDER_RESULTS.REJECTED) {
    const approved = order.paymentAttempts.at(-1);
    const refund = {
      transactionId: approved?.transactionId ?? null,
      status: REFUND_STATUS,
      message: 'Reembolso por orden rechazada.',
      timestamp,
    };
    return {
      ...updated,
      paymentAttempts: [...order.paymentAttempts, refund],
      orderStatus: ORDER_STATUS.FAILED,
      paymentStatus: PAYMENT_STATUS.REFUNDED,
    };
  }
  return { ...updated, orderStatus: ORDER_STATUS.PENDING, paymentStatus: PAYMENT_STATUS.APPROVED };
}
