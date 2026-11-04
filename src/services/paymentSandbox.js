// Simula un proveedor externo de pagos. No usa tarjetas ni datos financieros reales.

export const PAYMENT_RESULTS = {
  APPROVED: 'PAYMENT_APPROVED',
  DECLINED: 'PAYMENT_DECLINED',
  ERROR: 'PAYMENT_ERROR',
};

// Escenarios seleccionables en el sandbox para probar cada resultado.
export const SANDBOX_SCENARIOS = [
  { value: PAYMENT_RESULTS.APPROVED, label: 'Pago aprobado' },
  { value: PAYMENT_RESULTS.DECLINED, label: 'Pago rechazado' },
  { value: PAYMENT_RESULTS.ERROR, label: 'Error del servicio' },
];

// Retardo simulado para que la UI muestre el estado "procesando".
const PROCESSING_DELAY_MS = 1500;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Procesa un pago simulado tras un retardo artificial.
 *
 * Devuelve un objeto con transactionId, status y message. Lanza si faltan
 * datos obligatorios o si el escenario es ERROR.
 */
// En el escenario de error lanza una excepción, como un servicio que no responde
export async function processPayment({ orderId, amount, currency }, scenario) {
  await wait(PROCESSING_DELAY_MS);

  // Validación de entrada + escenario de error: ambos se tratan igual (throw).
  if (!orderId || !(amount > 0) || !currency || scenario === PAYMENT_RESULTS.ERROR) {
    throw new Error('El servicio de pagos no pudo procesar la solicitud');
  }

  const approved = scenario === PAYMENT_RESULTS.APPROVED;

  return {
    orderId,
    transactionId: `TXN-${Date.now()}`,
    status: approved ? PAYMENT_RESULTS.APPROVED : PAYMENT_RESULTS.DECLINED,
    message: approved ? 'Pago aprobado.' : 'Fondos insuficientes.',
    amount,
    currency,
    timestamp: new Date().toISOString(),
  };
}