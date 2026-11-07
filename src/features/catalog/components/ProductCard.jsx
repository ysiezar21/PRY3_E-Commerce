/**
 * Tarjeta individual de producto en el grid del catálogo.
 *
 * Recibe un `hit` de Algolia con los datos del producto.
 * Al hacer clic navega al detalle, pasando como query param la
 * página actual del catálogo para poder restaurarla al volver.
 */

import { useNavigate } from 'react-router-dom';
import { useInstantSearch } from 'react-instantsearch';
import { useAuth } from '../../auth/AuthContext'; // <-- NUEVO
import { getPricingForUser } from '../pricing'; // <-- NUEVO
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
  const { currentUser } = useAuth(); // <-- Obtenemos el usuario logueado

  // Calculamos el precio, si es B2B y la cantidad mínima requerida
  const { price, isB2B, minimumOrder } = getPricingForUser(hit, currentUser);

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
        
        {isB2B && (
          <div className="b2b-tag">
            Mayorista (Mín. {minimumOrder})
          </div>
        )}

        <p className="price">{formatCRC(price)}</p>
        
        {/* Le pasamos el precio calculado y la cantidad mínima al botón */}
        <AddToCartButton 
          product={hit} 
          appliedPrice={price} 
          minimumOrder={minimumOrder} 
        />
      </div>
    </div>
  );
};

export default ProductCard;