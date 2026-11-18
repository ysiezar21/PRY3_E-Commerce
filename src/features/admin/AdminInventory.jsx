/**
 * Panel administrativo: consulta de inventario por sucursal.
 *
 * Muestra el stock de cada producto en cada sucursal (multi_sede) y el total.
 * Las sucursales sin unidades se marcan como agotadas.
 */
import { useEffect, useState } from 'react';
import { fetchProducts, matchesQuery } from './adminCatalog';
import { BRANCHES, getStockAtBranch, getTotalStock } from '../branches/branches';
import '../../styles/pages/OrdersPage.css';

// Filas visibles a la vez; el buscador ayuda a encontrar el resto.
const PAGE_SIZE = 50;

const hasBranchOut = (product) => BRANCHES.some((branch) => getStockAtBranch(product, branch.id) === 0);

export default function AdminInventory() {
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const [onlyOut, setOnlyOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetchProducts().then((data) => {
      if (active) setResult(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!result) {
    return <p className="orders-page__loading">Cargando el inventario...</p>;
  }

  if (!result.ok) {
    return (
      <p className="orders-page__notice" role="alert">
        No pudimos cargar el inventario desde Algolia. Intente de nuevo más tarde.
      </p>
    );
  }

  const { products } = result;
  const outCount = products.filter(hasBranchOut).length;
  const filtered = products.filter(
    (product) => matchesQuery(product, query) && (!onlyOut || hasBranchOut(product))
  );
  const visible = filtered.slice(0, PAGE_SIZE);

  return (
    <section className="admin-section" aria-labelledby="admin-inventory-title">
      <h2 id="admin-inventory-title">Inventario</h2>
      <p className="admin-section__intro">
        Disponibilidad por sucursal. {outCount} productos están agotados en al menos una sucursal.
      </p>

      <div className="admin-section__filters">
        <label>
          <span>Buscar</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, categoría o código"
          />
        </label>
        <label className="admin-section__checkbox">
          <input
            type="checkbox"
            checked={onlyOut}
            onChange={(event) => setOnlyOut(event.target.checked)}
          />
          <span>Solo productos agotados en alguna sucursal</span>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-section__empty">Ningún producto coincide con la búsqueda.</p>
      ) : (
        <div className="orders-page__table-wrapper">
          <table className="orders-page__table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                {BRANCHES.map((branch) => (
                  <th key={branch.id} scope="col">{branch.name}</th>
                ))}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.objectID}>
                  <td>{product.name}</td>
                  {BRANCHES.map((branch) => {
                    const qty = getStockAtBranch(product, branch.id);
                    return (
                      <td key={branch.id} className={qty === 0 ? 'admin-stock--out' : ''}>
                        {qty === 0 ? 'Agotado' : qty}
                      </td>
                    );
                  })}
                  <td><strong>{getTotalStock(product)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <p className="admin-section__more">
          Mostrando {PAGE_SIZE} de {filtered.length}. Use el buscador para encontrar otros productos.
        </p>
      )}
    </section>
  );
}
