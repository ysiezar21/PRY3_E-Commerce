/**
 * Panel administrativo: consulta de productos y modificación simulada de precios.
 *
 * Muestra el catálogo con precio B2C, precio B2B y mínimo B2B.
 * Operación simulada: cambiar el precio B2C o B2B de un producto. El cambio se
 * guarda en localStorage (no en Algolia) y queda en un historial con el valor
 * anterior y el nuevo.
 */
import { useEffect, useState } from 'react';
import {
  fetchProducts,
  loadChanges,
  saveChanges,
  applyChanges,
  validatePrices,
  getCategoryLabel,
  matchesQuery,
  PRICE_FIELDS,
} from './adminCatalog';
import { formatCRC } from '../cart/formatCurrency';
import { formatOrderDate } from '../orders/formatOrderDate';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/pages/OrdersPage.css';

// Filas visibles a la vez; el buscador ayuda a encontrar el resto.
const PAGE_SIZE = 50;

export default function AdminProducts() {
  const [result, setResult] = useState(null);
  const [changes, setChanges] = useState(loadChanges);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // { id, price, wholesale }
  const [error, setError] = useState('');
  const [lastChange, setLastChange] = useState('');
  const [confirmingReset, setConfirmingReset] = useState(false);

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
    return <p className="orders-page__loading">Cargando el catálogo...</p>;
  }

  if (!result.ok) {
    return (
      <p className="orders-page__notice" role="alert">
        No pudimos cargar el catálogo desde Algolia. Intente de nuevo más tarde.
      </p>
    );
  }

  const products = applyChanges(result.products, changes);
  const filtered = products.filter((product) => matchesQuery(product, query));
  const visible = filtered.slice(0, PAGE_SIZE);

  const startEditing = (product) => {
    setEditing({
      id: product.objectID,
      price: String(product.price ?? ''),
      wholesale: String(product.b2b_info?.wholesale_price ?? ''),
    });
    setError('');
  };

  const saveEditing = (product) => {
    const newPrice = Number(editing.price);
    const newWholesale = Number(editing.wholesale);

    const message = validatePrices(newPrice, newWholesale);
    if (message) {
      setError(message);
      return;
    }

    // Un registro por cada precio que realmente cambió.
    const date = new Date().toISOString();
    const updates = [
      { field: 'price', oldValue: product.price, newValue: newPrice },
      { field: 'wholesale_price', oldValue: product.b2b_info?.wholesale_price, newValue: newWholesale },
    ]
      .filter((update) => update.oldValue !== update.newValue)
      .map((update) => ({ ...update, date, productId: product.objectID, productName: product.name }));

    if (updates.length > 0) {
      const next = [...changes, ...updates];
      setChanges(next);
      saveChanges(next);
      setLastChange(
        updates
          .map((u) => `${PRICE_FIELDS[u.field]} de "${product.name}": ${formatCRC(u.oldValue)} a ${formatCRC(u.newValue)}`)
          .join(' · ')
      );
    }
    setEditing(null);
    setError('');
  };

  const resetChanges = () => {
    setChanges([]);
    saveChanges([]);
    setLastChange('');
    setConfirmingReset(false);
  };

  return (
    <section className="admin-section" aria-labelledby="admin-products-title">
      <h2 id="admin-products-title">Productos</h2>
      <p className="admin-section__intro">
        {products.length} productos. Precio B2C, precio B2B y pedido mínimo B2B.
      </p>

      <p className="admin-section__notice">
        Modificación simulada: los cambios de precio se guardan solo en este navegador. No
        modifican Algolia ni los precios del catálogo.
      </p>

      {lastChange && (
        <p className="admin-section__success" role="status">
          Cambio guardado. {lastChange}
        </p>
      )}

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
      </div>

      {filtered.length === 0 ? (
        <p className="admin-section__empty">Ningún producto coincide con la búsqueda.</p>
      ) : (
        <div className="orders-page__table-wrapper">
          <table className="orders-page__table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col">Precio B2C</th>
                <th scope="col">Precio B2B</th>
                <th scope="col">Mín. B2B</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const isEditing = editing?.id === product.objectID;
                const b2b = product.b2b_info ?? {};
                // Mayorista inválido: el catálogo le cobra el precio público al B2B.
                const invalidB2B = validatePrices(product.price, b2b.wholesale_price) !== '';

                return (
                  <tr key={product.objectID}>
                    <td>
                      {product.name}
                      {product.modified && <span className="admin-pill">Modificado</span>}
                    </td>
                    <td>{getCategoryLabel(product)}</td>

                    {isEditing ? (
                      <>
                        <td>
                          <input
                            className="admin-section__price-input"
                            type="number"
                            min="1"
                            value={editing.price}
                            onChange={(event) => setEditing({ ...editing, price: event.target.value })}
                            aria-label={`Nuevo precio B2C de ${product.name}`}
                          />
                        </td>
                        <td>
                          <input
                            className="admin-section__price-input"
                            type="number"
                            min="1"
                            value={editing.wholesale}
                            onChange={(event) => setEditing({ ...editing, wholesale: event.target.value })}
                            aria-label={`Nuevo precio B2B de ${product.name}`}
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{product.price > 0 ? formatCRC(product.price) : 'No disponible'}</td>
                        <td>
                          {formatCRC(b2b.wholesale_price)}
                          {invalidB2B && <span className="admin-pill admin-pill--warn">Inválido</span>}
                        </td>
                      </>
                    )}

                    <td>{b2b.minimum_order ?? 1}</td>
                    <td>
                      {isEditing ? (
                        <div className="admin-section__row-actions">
                          <button type="button" className="admin-button" onClick={() => saveEditing(product)}>
                            Guardar
                          </button>
                          <button
                            type="button"
                            className="admin-button admin-button--secondary"
                            onClick={() => setEditing(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="admin-button admin-button--secondary"
                          onClick={() => startEditing(product)}
                        >
                          Modificar precio
                        </button>
                      )}
                      {isEditing && error && (
                        <p className="admin-section__error" role="alert">{error}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <p className="admin-section__more">
          Mostrando {PAGE_SIZE} de {filtered.length}. Use el buscador para encontrar otros productos.
        </p>
      )}

      {/* Historial de cambios simulados: qué cambió y cuál fue el resultado */}
      <div className="admin-history">
        <div className="admin-history__header">
          <h3>Historial de cambios</h3>
          {changes.length > 0 && (
            <button
              type="button"
              className="admin-button admin-button--secondary"
              onClick={() => setConfirmingReset(true)}
            >
              Restablecer precios originales
            </button>
          )}
        </div>

        {changes.length === 0 ? (
          <p className="admin-section__empty">Todavía no se ha modificado ningún precio.</p>
        ) : (
          <div className="orders-page__table-wrapper">
            <table className="orders-page__table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Producto</th>
                  <th scope="col">Campo</th>
                  <th scope="col">Valor anterior</th>
                  <th scope="col">Valor nuevo</th>
                </tr>
              </thead>
              <tbody>
                {[...changes].reverse().map((change, index) => (
                  <tr key={`${change.date}-${change.field}-${index}`}>
                    <td>{formatOrderDate(change.date)}</td>
                    <td>{change.productName}</td>
                    <td>{PRICE_FIELDS[change.field]}</td>
                    <td>{formatCRC(change.oldValue)}</td>
                    <td>{formatCRC(change.newValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingReset}
        message="¿Restablecer todos los precios a los valores originales de Algolia? Se borrará el historial."
        confirmLabel="Restablecer"
        onConfirm={resetChanges}
        onCancel={() => setConfirmingReset(false)}
      />
    </section>
  );
}
