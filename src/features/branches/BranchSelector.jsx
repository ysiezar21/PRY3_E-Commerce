/**
 * Selector de sucursal en el checkout.
 *
 * Muestra una tarjeta por sucursal. Solo se pueden elegir las que tienen
 * stock para todo el carrito. Con una sucursal elegida, lista la
 * disponibilidad de cada producto en ella.
 */
import { Link } from 'react-router-dom';
import { BRANCHES, getBranchName, hasStockFor } from './branches';

export default function BranchSelector({ title, value, onChange, items, error }) {
  const noBranchAvailable = BRANCHES.every((branch) => !hasStockFor(items, branch.id));

  return (
    <div className="branch-selector">
      <p className="branch-selector__title">{title}</p>

      <div className="branch-selector__options" id="checkout-branch" tabIndex={-1}>
        {BRANCHES.map((branch) => {
          const available = hasStockFor(items, branch.id);
          const selected = value === branch.id;
          return (
            <button
              key={branch.id}
              type="button"
              className={`branch-card ${selected ? 'is-selected' : ''}`}
              onClick={() => onChange(branch.id)}
              disabled={!available}
              aria-pressed={selected}
            >
              <span className="branch-card__name">{branch.name}</span>
              <span className={`branch-card__status ${available ? '' : 'is-out'}`}>
                {available ? 'Disponible' : 'Stock insuficiente'}
              </span>
            </button>
          );
        })}
      </div>

      {noBranchAvailable && (
        <p className="branch-selector__error" role="alert">
          Ninguna sucursal tiene stock para todo el pedido.{' '}
          <Link to="/carrito">Ajuste las cantidades en el carrito</Link>.
        </p>
      )}

      {error && !noBranchAvailable && (
        <p className="branch-selector__error" role="alert">{error}</p>
      )}

      {/* Disponibilidad de cada producto en la sucursal elegida */}
      {value && (
        <ul className="branch-selector__stock">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>
                Disponible en {getBranchName(value)}: {item.multi_sede?.[value] ?? 0} · Cantidad:{' '}
                {item.quantity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
