/**
 * Botón "Agregar al carrito" reutilizable (catálogo y detalle).
 *
 * Tras agregar, muestra "✓ Agregado".
 * Se deshabilita si el producto está agotado o si el carrito ya tiene todas
 * las unidades disponibles (noMoreStock).
 */

import { useState, useRef, useEffect } from 'react';
import { useCart } from './CartContext';

export default function AddToCartButton({ product, className = '' }) {
  const { addItem, items } = useCart();

  // added: controla el feedback visual "✓ Agregado".
  // timerRef: guarda el timeout para poder limpiarlo al desmontar o al
  // volver a pulsar antes de que expire.
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  // Al desmontar, cancelamos el timeout pendiente para evitar setState
  // sobre un componente que ya no está montado.
  useEffect(() => () => clearTimeout(timerRef.current), []);

  // Unidades del producto ya presentes en el carrito (0 si no está).
  const inCart = items.find((item) => item.id === product.id)?.quantity ?? 0;

  // outOfStock: el producto no tiene stock en absoluto.
  // noMoreStock: sí hay stock, pero ya se agregó todo lo disponible.
  const outOfStock = product.stock <= 0;
  const noMoreStock = !outOfStock && inCart >= product.stock;

  const handleClick = (e) => {
    // La tarjeta del catálogo entera es clicable (navega al detalle):
    // sin esto, agregar al carrito también abriría el detalle.
    e.stopPropagation();
    if (outOfStock || noMoreStock) return;

    addItem(product);
    setAdded(true);

    // Reiniciamos el temporizador en cada click para que el feedback
    // de 1.5 s vuelva a empezar aunque el usuario pulse rápido.
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      type="button"
      className={`add-to-cart-btn ${added ? 'is-added' : ''} ${className}`}
      onClick={handleClick}
      disabled={outOfStock || noMoreStock}
      // aria-live="polite" anuncia el cambio de texto a los lectores de
      // pantalla sin interrumpir lo que estén leyendo.
      aria-live="polite"
    >
      {/* Prioridad del texto: agotado > sin más stock > feedback > acción. */}
      {outOfStock
        ? 'Agotado'
        : noMoreStock
        ? '✗ No hay más stock'
        : added
        ? '✓ Agregado'
        : 'Agregar al carrito'}
    </button>
  );
}