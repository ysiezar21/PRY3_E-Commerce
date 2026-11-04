import { IVA_RATE, SHIPPING_RATE, SHIPPING_MIN, FREE_SHIPPING_THRESHOLD } from './cartConfig';

// Subtotal de una sola línea del carrito.
export function getLineSubtotal(item) {
  return item.price * item.quantity;
}

// Suma los subtotales de todas las líneas.
export function getCartSubtotal(items) {
  return items.reduce((sum, item) => sum + getLineSubtotal(item), 0);
}

// Envío: 3% del subtotal, con mínimo ₡2.500, gratis desde ₡400.000.
// Regla documentada en el README (no viene del catálogo del Proyecto I,
// que no maneja costos de envío).
export function getShippingCost(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return Math.max(SHIPPING_MIN, subtotal * SHIPPING_RATE);
}

// Calcula el resumen completo de compra a partir de los items del carrito.
export function getCartSummary(items) {
  const subtotal = getCartSubtotal(items);
  const iva = subtotal * IVA_RATE;
  const shipping = getShippingCost(subtotal);
  const total = subtotal + iva + shipping;

  return { subtotal, iva, shipping, total };
}