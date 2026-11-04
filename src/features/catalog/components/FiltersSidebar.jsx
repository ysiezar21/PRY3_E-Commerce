/**
 * Panel lateral de filtros del catálogo.
 *
 * Agrupa los filtros de precio, marca y categoría.
 * En desktop se muestra siempre (columna fija).
 * En móvil arranca colapsado y el usuario lo abre/cierra con un botón,
 * así no tapa el listado de productos ni depende de scroll interno.
 */

import { useState } from 'react';
import CategoryFilter from './CategoryFilter';
import PriceSlider from './PriceSlider';

const FiltersSidebar = () => {
  // Solo aplica en móvil (en desktop el CSS ignora este estado y
  // siempre muestra el contenido).
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className={`filters-sidebar ${isOpen ? 'is-open' : ''}`}>
      {/* Botón visible solo en móvil (ver media query en el CSS) */}
      <button
        type="button"
        className="filters-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Filtros
        <span className="filters-toggle-icon">{isOpen ? '−' : '+'}</span>
      </button>

      {/* Título visible solo en desktop */}
      <h3 className="filters-title">Filtros</h3>

      <div className="filters-content">
        <div className="filter-group">
          <h4>Precio</h4>
          <PriceSlider attribute="price" />
        </div>

        <div className="filter-group">
          <h4>Marca</h4>
          <CategoryFilter attribute="brand" />
        </div>

        <div className="filter-group">
          <h4>Categoría</h4>
          <CategoryFilter attribute="categories" />
        </div>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
