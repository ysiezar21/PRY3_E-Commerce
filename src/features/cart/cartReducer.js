export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_BRANCH: 'SET_BRANCH', // <-- NUEVO
};

export const initialCartState = { items: [], branchId: null }; // <-- branchId

export function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { id, name, price, image, stock, minimumOrder = 1, multi_sede } = action.payload;
      const exists = state.items.some((item) => item.id === id);
      
      return {
        ...state,
        items: exists
          ? state.items.map((item) =>
              item.id === id && item.quantity < item.stock
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.items, {
              id, name, price, image, stock, minimumOrder, multi_sede,
              quantity: minimumOrder,
            }],
      };
    }

    case CART_ACTIONS.INCREMENT:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload && item.quantity < item.stock
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case CART_ACTIONS.DECREMENT:
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(item.minimumOrder || 1, item.quantity - 1) }
            : item
        ),
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };

    case CART_ACTIONS.CLEAR_CART:
      return initialCartState;

    // cambia la sucursal y recorta cantidades al stock disponible.
    case CART_ACTIONS.SET_BRANCH: {
      const newBranch = action.payload;
      return {
        ...state,
        branchId: newBranch,
        items: state.items.map((item) => {
          const branchStock = newBranch
            ? (item.multi_sede?.[newBranch] ?? 0)
            : item.stock;
          const minQty = item.minimumOrder || 1;
          // El máximo real es el stock de la sucursal; el mínimo, el de la regla B2B.
          const newQuantity = Math.min(item.quantity, branchStock);
          return {
            ...item,
            // Nunca bajamos del mínimo (aunque quede por encima del stock,
            // para que el usuario vea la advertencia en lugar de un ajuste silencioso).
            quantity: Math.max(minQty, newQuantity),
          };
        }),
      };
    }

    default:
      return state;
  }
}