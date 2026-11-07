/**
 * Selector de sucursal para el carrito.
 *
 * El usuario elige una sola sucursal; todos los productos se validan
 * contra ese stock. Se muestra cuántas sucursales tienen stock del
 * carrito completo (informativo).
 */
import { BRANCHES, getBranchName } from './branches';

export default function BranchSelector({ value, onChange, items }) {
  // Cuántas sucursales tienen stock de TODOS los productos del carrito.
  const availableBranches = BRANCHES.filter((branch) =>
    items.every((item) => (item.multi_sede?.[branch.id] ?? 0) >= (item.minimumOrder || 1))
  );

  return (
    <div className="branch-selector">
      <label htmlFor="branch-select" className="branch-selector__label">
        Sucursal de retiro o entrega: 
      </label>
      <select
        id="branch-select"
        className="branch-selector__select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Seleccione una sucursal…</option>
        {BRANCHES.map((branch) => {
          const hasStock = availableBranches.some((b) => b.id === branch.id);
          return (
            <option key={branch.id} value={branch.id}>
              {branch.name} {hasStock ? '' : '— stock insuficiente'}
            </option>
          );
        })}
      </select>

      {value && (
        <p className="branch-selector__hint">
          Productos desde <strong>{getBranchName(value)}</strong>. Los precios y
          cantidades ya fueron ajustados al stock de esta sucursal.
        </p>
      )}
    </div>
  );
}