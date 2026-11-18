import { processOrder, ORDER_RESULTS } from '../../services/orderSandbox';
import { applyOrderResult, isAwaitingOrder, ORDER_STATUS } from './orderModel';
import { saveOrder } from './orderStorage';
import { saveOrderToAlgolia, syncLocalOrders } from './ordersService';

// Crea la orden después de un pago aprobado.
// Nunca lanza error y NUNCA vuelve a cobrar: solo consulta al servicio de órdenes.
export async function fulfillOrder(order, scenario) {
  // Solo tiene sentido con el pago aprobado y la orden pendiente
  if (!isAwaitingOrder(order)) return order;

  const request = {
    orderId: order.orderNumber,
    transactionId: order.paymentAttempts.at(-1)?.transactionId,
  };

  let response;
  try {
    response = await processOrder(request, scenario);
  } catch {
    response = {
      status: ORDER_RESULTS.ERROR,
      message: 'No pudimos comunicarnos con el servicio de órdenes.',
    };
  }

  const updated = applyOrderResult(order, response);
  saveOrder(updated);

  // Solo las órdenes confirmadas van al índice de Algolia. Si el guardado falla,
  // la orden sigue confirmada y guardada en el navegador (no se revierte la compra).
  if (updated.orderStatus === ORDER_STATUS.CONFIRMED) {
    await saveOrderToAlgolia(updated);
    // De paso, sube las órdenes anteriores que hayan quedado pendientes.
    syncLocalOrders();
  }

  return updated;
}
