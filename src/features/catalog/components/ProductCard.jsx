/**
 * Tarjeta individual de producto en el grid del catálogo.
 *
 * Recibe un `hit` de Algolia con los datos del producto.
 * Al hacer clic navega al detalle, pasando como query param la
 * página actual del catálogo para poder restaurarla al volver.
 */

import { useNavigate } from 'react-router-dom';
import { useInstantSearch } from 'react-instantsearch';
import AddToCartButton from '../../cart/AddToCartButton';

// Formatea un número como colón costarricense sin decimales.
const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

// `categories` es un arreglo; se normaliza a un texto para mostrar en la tarjeta.
// Se mantiene el respaldo con `category` por si algún hit viejo aún lo trae.
const getCategoryLabel = (hit) => {
  if (Array.isArray(hit.categories) && hit.categories.length > 0) {
    return hit.categories.join(', ');
  }
  return hit.category || 'Sin categoría';
};

const ProductCard = ({ hit }) => {
  const navigate = useNavigate();
  const { uiState } = useInstantSearch();

  const handleProductClick = () => {
    // Guarda la página actual del catálogo en la URL del detalle para
    // poder restaurarla cuando el usuario vuelva atrás.
    const currentPage = uiState?.['grupo-06_products']?.page || 0;
    navigate(`/producto/${hit.id}?page=${currentPage}`);
  };

  return (
    <div className="product-card" onClick={handleProductClick} style={{ cursor: 'pointer' }}>
      {hit.images?.[0] ? (
        // loading="lazy" difiere la carga hasta que la imagen entra al viewport.
        <img src={hit.images[0]} alt={hit.name} loading="lazy" />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}
      <div className="product-info">
        <h3>{hit.name}</h3>
        <p className="category">{getCategoryLabel(hit)}</p>
        <p className="price">{formatCRC(hit.price)}</p>
        <AddToCartButton product={hit} />
      </div>
    </div>
  );
};

export default ProductCard;