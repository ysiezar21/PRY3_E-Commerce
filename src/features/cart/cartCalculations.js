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
export function getShippingCost(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return Math.max(SHIPPING_MIN, subtotal * SHIPPING_RATE);
}

// Calcula el resumen completo de compra a partir de los items del carrito.
// withShipping = false para retiro en sucursal (sin costo de envío).
export function getCartSummary(items, withShipping = true) {
  const subtotal = getCartSubtotal(items);
  const iva = subtotal * IVA_RATE;
  const shipping = withShipping ? getShippingCost(subtotal) : 0;
  const total = subtotal + iva + shipping;

  return { subtotal, iva, shipping, total };
}

// Revisa el pedido mínimo B2B. El carrito y el checkout la usan para impedir continuar.
export function validateB2BConditions(items) {
  const invalid = items.find((item) => item.quantity < (item.minimumOrder || 1));

  if (!invalid) return { isValid: true, message: '' };

  return {
    isValid: false,
    message: `"${invalid.name}" requiere un mínimo de ${invalid.minimumOrder} unidades para precio mayorista.`,
  };
}