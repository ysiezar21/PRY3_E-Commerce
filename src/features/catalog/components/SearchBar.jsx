/**
 * Barra de búsqueda del Navbar.
 *
 * useSearchBox expone el texto actual (query) y refine para buscar en Algolia.
 * Si el usuario busca desde otra página (detalle, carrito), se le lleva
 * al catálogo para que vea los resultados.
 */

import { useSearchBox } from 'react-instantsearch';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const { query, refine } = useSearchBox();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    refine(e.target.value);
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <div className="search-wrapper" role="search">
      <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Buscar productos, marcas o categorías..."
        className="search-input"
        aria-label="Buscar productos"
      />
    </div>
  );
};

export default SearchBar;
