import { useState } from 'react';
import { useCart } from './CartContext';
import { getLineSubtotal } from './cartCalculations';
import { formatCRC } from './formatCurrency';
import { getBranchName } from '../branches/branches';
import ConfirmDialog from '../../components/ConfirmDialog';

/**
 * Línea individual del carrito.
 *
 * Muestra imagen, nombre, precio unitario, control de cantidad (+/−),
 * subtotal y botón de eliminar. El eliminar pide confirmación antes de
 * quitar el producto.
 *
 * Reglas de cantidad:
 *   - B2C: mínimo 1.
 *   - B2B: mínimo `item.minimumOrder` (no se puede bajar de ahí).
 *   - Con sucursal elegida: el máximo es el stock de esa sucursal.
 */
export default function CartLineItem({ item }) {
  const { increment, decrement, removeItem, branchId } = useCart();
  const [confirming, setConfirming] = useState(false);

  // Mínimo permitido según el rol (1 para B2C, N para productos B2B).
  const minQuantity = item.minimumOrder || 1;
  const isAtMinimum = item.quantity <= minQuantity;

  // Stock disponible según la sucursal elegida (o total si no hay sucursal).
  const branchStock = branchId
    ? (item.multi_sede?.[branchId] ?? 0)
    : item.stock;

  // La sucursal elegida no alcanza ni siquiera el mínimo B2B del producto.
  const branchInsufficient = Boolean(branchId) && branchStock < minQuantity;

  // Con sucursal, el tope real es el stock de la sucursal.
  const maxQuantity = branchId ? branchStock : item.stock;
  const isAtBranchMax = Boolean(branchId) && item.quantity >= branchStock;

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

        {minQuantity > 1 && (
          <p className="cart-line__min-order">
            {isAtMinimum
              ? `Mínimo alcanzado: ${minQuantity} uds`
              : `Mín. mayoreo: ${minQuantity} uds`}
          </p>
        )}

        {branchId && branchInsufficient && (
          <p className="cart-line__branch-warn">
            ⚠ Sin stock suficiente en {getBranchName(branchId)} (hay {branchStock})
          </p>
        )}

        {branchId && !branchInsufficient && (
          <p className="cart-line__branch-stock">
            Disponible en {getBranchName(branchId)}: {branchStock} uds
          </p>
        )}
      </div>

      <div className="cart-line__quantity">
        <button
          type="button"
          className="qty-btn"
          onClick={() => decrement(item.id)}
          disabled={isAtMinimum}
          aria-label={`Disminuir cantidad de ${item.name}`}
          title={isAtMinimum && minQuantity > 1
            ? `Mínimo ${minQuantity} unidades para mayoreo`
            : ''}
        >
          −
        </button>
        <span aria-live="polite">{item.quantity}</span>
        <button
          type="button"
          className="qty-btn"
          onClick={() => increment(item.id)}
          disabled={isAtBranchMax || item.quantity >= maxQuantity}
          aria-label={`Aumentar cantidad de ${item.name}`}
          title={isAtBranchMax
            ? `Sin más stock en ${getBranchName(branchId)}`
            : ''}
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