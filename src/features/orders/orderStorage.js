// Las órdenes se guardan por número de orden, así la pantalla de
// confirmación puede encontrarlas aunque se recargue la página.
// La llave es específica de este proyecto (localStorage se comparte en *.github.io).
import { isAwaitingOrder } from './orderModel';

const STORAGE_KEY = 'pry2-ecommerce-orders';

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// Guarda la orden, o la actualiza si ya existía.
export function saveOrder(order) {
  try {
    const orders = loadOrders();
    orders[order.orderNumber] = order;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue, solo sin persistencia.
  }
}

// Devuelve la orden guardada, o null si no existe.
export function getOrder(orderNumber) {
  return loadOrders()[orderNumber] ?? null;
}

// Firma de una lista de productos (id, cantidad y precio) para compararlas.
const signature = (lines) =>
  lines
    .map((line) => `${line.id}:${line.quantity}:${line.unitPrice ?? line.price}`)
    .sort()
    .join('|');

// Busca una orden con el pago aprobado cuya creación quedó sin terminar (por ejemplo,
// si el usuario recargó la página) y que corresponda a lo que hay en el carrito.
// Así se retoma la creación de la orden en lugar de cobrar otra vez.
export function findAwaitingOrder(cartItems) {
  if (cartItems.length === 0) return null;
  const cartSignature = signature(cartItems);

  return (
    Object.values(loadOrders())
      .filter((order) => isAwaitingOrder(order) && signature(order.items) === cartSignature)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
  );
}
