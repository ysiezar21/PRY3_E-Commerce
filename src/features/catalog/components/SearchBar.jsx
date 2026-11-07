/**
 * Barra de búsqueda del Navbar.
 *
 * useSearchBox expone el texto actual (query) y refine para buscar en Algolia.
 * Si el usuario busca desde otra página (detalle, carrito), se le lleva
 * al catálogo para que vea los resultados.
 * 
 * Registra el término en analytics usando debounce para no saturar.
 */

import { useState, useEffect } from 'react';
import { useSearchBox } from 'react-instantsearch';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { trackSearch } from '../../analytics/analyticsService';

const SearchBar = () => {
  const { query, refine } = useSearchBox();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Estado local para el debounce del tracking
  const [trackedQuery, setTrackedQuery] = useState(query);

  // Efecto para hacer el debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // Si el query cambió y es válido, lo registramos
      if (query && query !== trackedQuery && query.length >= 2) {
        trackSearch(query, currentUser);
        setTrackedQuery(query);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [query, currentUser, trackedQuery]);

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