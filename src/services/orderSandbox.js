// Simula el servicio que crea la orden una vez que el pago fue aprobado
// (validar inventario, reservar los productos y registrar el pedido).
// Es distinto del servicio de pagos: un pago puede aprobarse y la orden fallar.

export const ORDER_RESULTS = {
  CONFIRMED: 'ORDER_CONFIRMED',
  REJECTED: 'ORDER_REJECTED',
  ERROR: 'ORDER_ERROR',
};

export const ORDER_SCENARIOS = [
  { value: ORDER_RESULTS.CONFIRMED, label: 'Orden confirmada' },
  { value: ORDER_RESULTS.REJECTED, label: 'Orden rechazada (sin inventario)' },
  { value: ORDER_RESULTS.ERROR, label: 'Error del servicio de órdenes' },
];

const PROCESSING_DELAY_MS = 1500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Recibe el número de orden y la transacción del pago aprobado.
// En el escenario de error lanza una excepción, como un servicio que no responde.
export async function processOrder({ orderId, transactionId }, scenario) {
  await wait(PROCESSING_DELAY_MS);

  const validScenario = scenario === ORDER_RESULTS.CONFIRMED || scenario === ORDER_RESULTS.REJECTED;
  if (!orderId || !transactionId || !validScenario) {
    throw new Error('El servicio de órdenes no pudo procesar la solicitud');
  }

  const confirmed = scenario === ORDER_RESULTS.CONFIRMED;

  return {
    orderId,
    status: confirmed ? ORDER_RESULTS.CONFIRMED : ORDER_RESULTS.REJECTED,
    message: confirmed ? 'Orden creada.' : 'Uno de los productos ya no tiene inventario disponible.',
    timestamp: new Date().toISOString(),
  };
}
