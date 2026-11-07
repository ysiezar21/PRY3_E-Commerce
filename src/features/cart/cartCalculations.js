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
export function getCartSummary(items) {
  const subtotal = getCartSubtotal(items);
  const iva = subtotal * IVA_RATE;
  const shipping = getShippingCost(subtotal);
  const total = subtotal + iva + shipping;

  return { subtotal, iva, shipping, total };
}

/**
 * NUEVO: Valida que los productos B2B en el carrito cumplan con la cantidad mínima.
 * Se usará en el Checkout para bloquear la compra si el usuario bajó la cantidad.
 */
export function validateB2BConditions(items) {
  const invalidItems = items.filter(
    (item) => item.minimumOrder && item.minimumOrder > 1 && item.quantity < item.minimumOrder
  );
  
  if (invalidItems.length > 0) {
    return {
      isValid: false,
      message: `El producto "${invalidItems[0].name}" requiere un mínimo de ${invalidItems[0].minimumOrder} unidades para precio mayorista.`
    };
  }
  
  return { isValid: true, message: '' };
}