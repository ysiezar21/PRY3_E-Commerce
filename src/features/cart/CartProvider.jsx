import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import { CartContext } from './CartContext';
import { cartReducer, CART_ACTIONS } from './cartReducer';
import { loadCart, saveCart } from './cartStorage';
import { useAuth } from '../auth/AuthContext';
import { can, PERMISSIONS } from '../auth/permissions';
import { PRICE_TYPES } from '../catalog/pricing';

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

  // Si cambia el usuario (login o logout), se recalculan los precios o se vacía el carrito
  useEffect(() => {
    const currentId = currentUser?.objectID ?? null;
    
    // Solo actuamos si realmente cambió el usuario, no en el montaje inicial
    if (prevUserIdRef.current !== currentId) {
      // Al iniciar sesión como cliente, el carrito se conserva con los precios de su rol.
      // Al cerrar sesión o entrar como admin (no compra), se vacía.
      if (currentUser && can(currentUser, PERMISSIONS.ADD_TO_CART)) {
        dispatch({ type: CART_ACTIONS.REPRICE, payload: currentUser });
      } else {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
      }
      prevUserIdRef.current = currentId;
    }
  }, [currentUser]);

  // ===== Acciones =====
  // addItem normaliza el producto al shape mínimo que guarda el carrito:
  // solo id, name, price, image y stock, para no inflar localStorage.
  const addItem = useCallback(
    (product, appliedPrice, minimumOrder = 1, priceType = PRICE_TYPES.B2C) =>
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: {
          id: product.id,
          name: product.name,
          price: appliedPrice || product.price, // <-- Guarda el precio B2B o B2C
          publicPrice: product.price, // <-- Para recalcular si cambia el rol
          b2bInfo: product.b2b_info, // <-- Para recalcular si cambia el rol
          image: product.images?.[0] ?? null,
          stock: product.stock,
          minimumOrder, // <-- Guarda la regla para validar después
          priceType, // <-- B2C o B2B
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