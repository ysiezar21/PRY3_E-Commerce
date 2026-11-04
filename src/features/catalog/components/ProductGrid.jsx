/**
 * Grid de resultados del catálogo.
 *
 * Usa useHits para obtener los productos que Algolia devolvió para la
 * búsqueda y filtros actuales, y los renderiza como tarjetas.
 *
 * Si no hay resultados, muestra un estado vacío con un mensaje.
 */

import { useHits, useInstantSearch } from 'react-instantsearch';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  const { items } = useHits();
  // useInstantSearch nos da el estado global de la búsqueda y el error si lo hay.
  const { status, error } = useInstantSearch();

  // Conexión fallida con Algolia
  if (status === 'error' || error) {
    return (
      <div className="empty-state">
        <p>La conexión con Algolia no se ejecutó correctamente</p>
        <p className="empty-sub">Se mostrarán todos los productos en cuanto se restablezca la conexión</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron productos</p>
          <p className="empty-sub">Prueba con otros términos de búsqueda</p>
        </div>
      ) : (
        items.map((hit) => <ProductCard key={hit.objectID} hit={hit} />)
      )}
    </div>
  );
};

export default ProductGrid;