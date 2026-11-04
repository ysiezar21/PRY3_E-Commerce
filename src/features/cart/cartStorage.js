import { initialCartState } from './cartReducer';

// localStorage es compartido por todos los repos de *.github.io,
// por eso la llave es específica de este proyecto.
const STORAGE_KEY = 'pry2-ecommerce-cart';

function isValidItem(item) {
  return (
    item &&
    item.id !== undefined &&
    typeof item.name === 'string' &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  );
}

// Lee el carrito guardado. Si no hay nada, o el JSON está dañado
// o fue manipulado, arranca con un carrito vacío en vez de romper la app.
export function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialCartState;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return initialCartState;
    return { items: parsed.items.filter(isValidItem) };
  } catch {
    return initialCartState;
  }
}

export function saveCart(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Almacenamiento lleno o bloqueado (modo privado): la app sigue
    // funcionando, solo que sin persistencia.
  }
}