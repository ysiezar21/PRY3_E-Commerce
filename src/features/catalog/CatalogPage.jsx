/**
 * Página principal del catálogo.
 *
 * El contexto de Algolia (InstantSearch) viene de MainLayout y la
 * búsqueda está en el Navbar. Aquí solo van el título, los filtros,
 * los productos y la paginación.
 *
 * Si hay un usuario activo, se muestra un bloque de personalización
 * (Ver mi actividad + búsquedas recientes + productos vistos) antes
 * del catálogo.
 */

import { Link } from 'react-router-dom';
import { Configure } from 'react-instantsearch';
import FiltersSidebar from './components/FiltersSidebar';
import ProductGrid from './components/ProductGrid';
import Pagination from './components/Pagination';
import RecentlyViewed from '../analytics/RecentlyViewed';
import RecentSearches from '../analytics/RecentSearches';
import { useAuth } from '../auth/AuthContext';

const CatalogPage = () => {
  const { currentUser } = useAuth();

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

      {/* Bloque de personalización: solo visible con usuario activo */}
      {currentUser && (
        <div className="catalog-personalization">
          <Link to="/analytics" className="catalog-personalization__link">
            Ver mi actividad
            <span aria-hidden="true">→</span>
          </Link>
          <RecentSearches />
          <RecentlyViewed />
        </div>
      )}

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