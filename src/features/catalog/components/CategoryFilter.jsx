/**
 * Lista de filtros por atributo (marca, categoría, etc).
 *
 * Usa useRefinementList de react-instantsearch, que devuelve:
 *   - items: valores disponibles del atributo con su conteo y si
 *     están activos (isRefined).
 *   - refine: función para activar/desactivar un valor.
 *   - canToggleShowMore, isShowingMore, toggleShowMore: control del
 *     botón "Mostrar más".
 *
 * El atributo a filtrar llega por prop, así el mismo componente
 * sirve para marca y categoría.
 */

import { useRefinementList } from 'react-instantsearch';

// Muestra 8 valores y el botón despliega el resto (hasta 100, el tope de Algolia)
const CategoryFilter = ({ attribute, limit = 8 }) => {
  const { items, refine, canToggleShowMore, isShowingMore, toggleShowMore } =
    useRefinementList({
      attribute,
      limit,
      showMore: true,
      showMoreLimit: 100,
    });

  return (
    <>
      <ul className="category-list">
        {items.map((item) => (
          <li key={item.label}>
            <label>
              {/* refine(item.value) alterna el filtro: si estaba activo lo
                  quita, y si no, lo aplica. */}
              <input
                type="checkbox"
                checked={item.isRefined}
                onChange={() => refine(item.value)}
              />
              {item.label} <span className="count">({item.count})</span>
            </label>
          </li>
        ))}
      </ul>

      {/* Solo aparece si hay más valores de los que se muestran */}
      {canToggleShowMore && (
        <button type="button" className="show-more-button" onClick={toggleShowMore}>
          {isShowingMore ? 'Mostrar menos' : 'Mostrar más'}
        </button>
      )}
    </>
  );
};

export default CategoryFilter;