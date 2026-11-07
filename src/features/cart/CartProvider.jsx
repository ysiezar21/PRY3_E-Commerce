import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { CartContext } from './CartContext';
import { cartReducer, CART_ACTIONS } from './cartReducer';
import { loadCart, saveCart } from './cartStorage';
import { useAuth } from '../auth/AuthContext';

/**
 * Provider del carrito.
 *
 * Envuelve la app y expone items, totales y acciones (addItem, increment,
 * decrement, removeItem, clearCart) a través de CartContext. El estado se
 * restaura de localStorage al montar y se persiste en cada cambio.
 */
export default function CartProvider({ children }) {
  // undefined = sin estado inicial directo; loadCart lo calcula una sola vez al montar
  const [state, dispatch] = useReducer(cartReducer, undefined, loadCart);

  const { currentUser } = useAuth();
  const prevUserIdRef = useRef(currentUser?.objectID ?? null);

  // Cada cambio en el carrito se guarda en localStorage
  useEffect(() => {
    saveCart(state);
  }, [state]);

  // si cambia el usuario (login o logout), reiniciamos el carrito
  useEffect(() => {
    const currentId = currentUser?.objectID ?? null;
    
    // Solo limpiamos si realmente cambió el usuario, no en el montaje inicial
    if (prevUserIdRef.current !== currentId) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      prevUserIdRef.current = currentId;
    }
  }, [currentUser]);

  // ===== Acciones =====
  // addItem normaliza el producto al shape mínimo que guarda el carrito:
  // solo id, name, price, image y stock, para no inflar localStorage.
  const addItem = useCallback(
    (product, appliedPrice, minimumOrder = 1) =>
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          id: product.id,
          name: product.name,
          price: appliedPrice || product.price, // <-- Guarda el precio B2B o B2C
          image: product.images?.[0] ?? null,
          stock: product.stock,
          minimumOrder, // <-- Guarda la regla para validar después
          multi_sede: product.multi_sede, // <-- Guarda el stock por sucursal
        },
      }),
    []
  );
  const increment = useCallback((id) => dispatch({ type: CART_ACTIONS.INCREMENT, payload: id }), []);
  const decrement = useCallback((id) => dispatch({ type: CART_ACTIONS.DECREMENT, payload: id }), []);
  const removeItem = useCallback((id) => dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: id }), []);
  const clearCart = useCallback(() => dispatch({ type: CART_ACTIONS.CLEAR_CART }), []);

  const setBranch = useCallback(
    (branchId) => dispatch({ type: CART_ACTIONS.SET_BRANCH, payload: branchId }),
    []
  );

  // totalItems: suma de cantidades, para el badge del icono del carrito.
  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      branchId: state.branchId,
      totalItems,
      addItem, increment, decrement, removeItem, clearCart,
      setBranch,
    }),
    [state.items, state.branchId, totalItems, addItem, increment, decrement, removeItem, clearCart, setBranch]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}