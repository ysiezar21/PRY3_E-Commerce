import { useState } from 'react';
import { useCart } from './CartContext';
import { getLineSubtotal } from './cartCalculations';
import { formatCRC } from './formatCurrency';
import ConfirmDialog from '../../components/ConfirmDialog';

/**
 * Línea individual del carrito.
 *
 * Muestra imagen, nombre, precio unitario, control de cantidad (+/−),
 * subtotal y botón de eliminar. El eliminar pide confirmación antes de
 * quitar el producto.
 */
export default function CartLineItem({ item }) {
  const { increment, decrement, removeItem } = useCart();

  // confirming: si es true, se abre el ConfirmDialog antes de eliminar.
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="cart-line">
      {item.image ? (
        <img src={item.image} alt={item.name} className="cart-line__image" />
      ) : (
        <div className="cart-line__image cart-line__image--placeholder">Sin imagen</div>
      )}

      <div className="cart-line__info">
        <p className="cart-line__name">{item.name}</p>
        <p className="cart-line__unit-price">{formatCRC(item.price)} c/u</p>
      </div>

      <div className="cart-line__quantity">
        <button
          type="button"
          className="qty-btn"
          onClick={() => decrement(item.id)}
          // No bajar de 1: para quitar el producto hay que usar "Eliminar".
          disabled={item.quantity <= 1}
          aria-label={`Disminuir cantidad de ${item.name}`}
        >
          −
        </button>
        <span aria-live="polite">{item.quantity}</span>
        <button
          type="button"
          className="qty-btn"
          onClick={() => increment(item.id)}
          // No superar el stock disponible del producto.
          disabled={item.quantity >= item.stock}
          aria-label={`Aumentar cantidad de ${item.name}`}
        >
          +
        </button>
      </div>

      <p className="cart-line__subtotal">{formatCRC(getLineSubtotal(item))}</p>

      <button
        type="button"
        className="cart-line__remove"
        onClick={() => setConfirming(true)}
        aria-label={`Eliminar ${item.name} del carrito`}
      >
        Eliminar
      </button>

      <ConfirmDialog
        open={confirming}
        message={`¿Seguro que deseas eliminar "${item.name}" del carrito?`}
        onConfirm={() => removeItem(item.id)}
        onCancel={() => setConfirming(false)}
      />
    </li>
  );
}