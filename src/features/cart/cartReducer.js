export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
};

export const initialCartState = { items: [] };

/**
 * Reducer del carrito.
 *
 * Única fuente de verdad para mutar items: cada acción devuelve un nuevo
 * estado sin tocar el anterior.
 */
// Cada item: { id, name, price, image, quantity }
// El subtotal por línea NO se guarda: se deriva (price * quantity)
// para evitar datos redundantes que puedan quedar desincronizados.
export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { id, name, price, image, stock } = action.payload;
      const exists = state.items.some((item) => item.id === id);
      // Si ya existe, suma 1 (respetando el stock); si no, lo agrega con quantity 1.
      return {
        items: exists
          ? state.items.map((item) =>
              item.id === id && item.quantity < item.stock
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            )
          : [...state.items, { id, name, price, image, stock, quantity: 1 }],
      };
    }
    case CART_ACTIONS.INCREMENT:
      // Suma 1 sin superar el stock del producto.
      return {
        items: state.items.map((item) =>
          item.id === action.payload && item.quantity < item.stock
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
    case CART_ACTIONS.DECREMENT:
      return {
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(1, item.quantity - 1) } // mínimo 1
            : item
        ),
      };
    case CART_ACTIONS.REMOVE_ITEM:
      return { items: state.items.filter((item) => item.id !== action.payload) };
    case CART_ACTIONS.CLEAR_CART:
      return initialCartState;
    default:
      return state;
  }
}