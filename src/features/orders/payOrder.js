import { processPayment, PAYMENT_RESULTS } from '../../services/paymentSandbox';
import { applyPaymentResult, startPayment } from './orderModel';
import { saveOrder } from './orderStorage';

/**
 * Ejecuta el pago de una orden contra el sandbox y devuelve la orden
 * actualizada y guardada.
 *
 * Nunca lanza: si el servicio falla, se refleja como PAYMENT_RESULTS.ERROR
 * en la orden en lugar de propagar la excepción.
 */
// Nunca lanza error: siempre devuelve la orden actualizada y guardada
export async function payOrder(order, scenario) {
  // 1) Marca la orden como "pagando" y la persiste para que la UI lo refleje.
  const pending = startPayment(order);
  saveOrder(pending);

  const request = { orderId: pending.orderNumber, amount: pending.total, currency: pending.currency };

  // 2) Llama al sandbox; un throw se normaliza al mismo shape que una respuesta.
  let response;
  try {
    response = await processPayment(request, scenario);
  } catch {
    response = {
      status: PAYMENT_RESULTS.ERROR,
      message: 'No pudimos comunicarnos con el servicio de pagos.',
    };
  }

  // 3) Aplica el resultado (aprobado/rechazado/error) y guarda la orden final.
  const updated = applyPaymentResult(pending, response);
  saveOrder(updated);
  return updated;
}