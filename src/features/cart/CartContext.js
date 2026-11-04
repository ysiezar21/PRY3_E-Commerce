import { createContext, useContext } from 'react';

export const CartContext = createContext(null);

// Hook para consumir el carrito desde cualquier componente.
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}