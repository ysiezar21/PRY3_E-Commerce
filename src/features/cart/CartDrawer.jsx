import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { getCartSubtotal } from './cartCalculations';
import { formatCRC } from './formatCurrency';
import CartLineItem from './CartLineItem';

/**
 * Menú lateral: etapa intermedia entre el catálogo y la página del carrito.
 *
 * Se cierra con la ✕, con clic en el overlay o con Escape.
 */
export default function CartDrawer({ open, onClose }) {
  const { items } = useCart();

  // ===== Cerrar con Escape =====
  // Solo activo mientras el drawer está abierto; limpia el listener al cerrar.
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />

      <aside
        className="cart-drawer"
        // Diálogo modal: el resto de la página queda inerte para lectores de pantalla.
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="cart-drawer__header">
          <h2 id="cart-drawer-title">Resumen del carrito</h2>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onClose}
            aria-label="Cerrar"
            // Lleva el foco al abrir para que Escape funcione sin tocar el ratón.
            autoFocus
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Tu carrito está vacío.</p>
            <button type="button" className="cart-drawer__secondary" onClick={onClose}>
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <ul className="cart-line-list cart-drawer__list">
              {items.map((item) => (
                <CartLineItem key={item.id} item={item} />
              ))}
            </ul>

            <div className="cart-drawer__footer">
              <p className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <strong>{formatCRC(getCartSubtotal(items))}</strong>
              </p>
              <Link to="/carrito" className="cart-drawer__primary" onClick={onClose}>
                Ver carrito
              </Link>
              <button type="button" className="cart-drawer__secondary" onClick={onClose}>
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}