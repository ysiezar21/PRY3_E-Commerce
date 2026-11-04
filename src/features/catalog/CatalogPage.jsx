/**
 * Página principal del catálogo.
 *
 * El contexto de Algolia (InstantSearch) viene de MainLayout y la
 * búsqueda está en el Navbar. Aquí solo van el título, los filtros,
 * los productos y la paginación.
 */

import { Configure } from 'react-instantsearch';
import FiltersSidebar from './components/FiltersSidebar';
import ProductGrid from './components/ProductGrid';
import Pagination from './components/Pagination';

const CatalogPage = () => {
  return (
    <>
      {/* 12 resultados por página */}
      <Configure hitsPerPage={12} />

      <section className="catalog-intro">
        <h1 className="catalog-title">Catálogo de Productos</h1>
        <p className="catalog-subtitle">
          Explora componentes, periféricos y equipamiento tecnológico con despacho a todo Costa Rica.
        </p>
      </section>

      <div className="results-section">
        <FiltersSidebar />
        <div className="products-section">
          <ProductGrid />
          <Pagination />
        </div>
      </div>
    </>
  );
};

export default CatalogPage;
