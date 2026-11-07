/**
 * Página de detalle de un producto.
 *
 * Carga el producto en dos pasos:
 *   1. Consulta Algolia por objectID (fuente principal).
 *   2. Si no existe en Algolia o falla la conexión, busca en el
 *      archivo local data/products.json como respaldo.
 *
 * Adapta el precio y la información B2B según el rol del usuario.
 * Lee el id desde la URL (/producto/:id) y, al volver al catálogo,
 * conserva el ?page=N que ProductCard añadió para restaurar la página.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { searchClient, indexName } from '../config/algolia';
import productsData from '../../data/products.json';
import AddToCartButton from '../features/cart/AddToCartButton';
import { useAuth } from '../features/auth/AuthContext';
import { getPricingForUser } from '../features/catalog/pricing';
import { BRANCHES, getStockAtBranch } from '../features/branches/branches';
import { trackProductView } from '../features/analytics/analyticsService';

const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const index = searchClient.initIndex(indexName);
        const response = await index.search('', {
          filters: `objectID:"${id}"`,
          hitsPerPage: 1,
        });

        if (response.hits.length > 0) {
          setProduct(response.hits[0]);
          trackProductView(response.hits[0], currentUser);
          setSelectedImageIndex(0);
        } else {
          loadProductFromLocal(id);
        }
      } catch (err) {
        console.error('Error fetching from Algolia:', err);
        loadProductFromLocal(id);
      } finally {
        setLoading(false);
      }
    };

    const loadProductFromLocal = (productId) => {
      try {
        const products = productsData.products || productsData;
        const found = products.find((p) => p.id === productId);

        if (found) {
          setProduct(found);
          setSelectedImageIndex(0);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error loading product locally:', err);
        setError('Error al cargar el producto');
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page');
    const pageQuery = page ? `?page=${page}` : '';
    navigate(`/${pageQuery}`);
  };

  if (loading) {
    return <div className="product-detail-loading">Cargando producto...</div>;
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <p>{error}</p>
        <button onClick={handleBack}>Volver al catálogo</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <p>Producto no encontrado</p>
        <button onClick={handleBack}>Volver al catálogo</button>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || null;

  // Precio y condiciones según el rol del usuario actual.
  const { price, isB2B, minimumOrder } = getPricingForUser(product, currentUser);

  return (
    <div className="product-detail-page">
      <div className="product-detail-header">
        <h1>Información del producto</h1>
        <button className="back-button" onClick={handleBack}>
          ← Volver al catálogo
        </button>
      </div>

      <div className="product-detail-container">
        <div className="product-gallery">
          {currentImage ? (
            <div className="main-image-container">
              <img src={currentImage} alt={product.name} className="main-image" />
            </div>
          ) : (
            <div className="no-image-large">Sin imagen</div>
          )}

          {images.length > 1 && (
            <div className="thumbnail-gallery">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  className={`thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-brand">{product.brand}</p>
            {product.model && <p className="product-model">Modelo: {product.model}</p>}
          </div>

          <div className="price-section">
            {isB2B && (
              <p className="product-price-tag">
                Precio mayorista · Mín. {minimumOrder} uds
              </p>
            )}
            <p className="product-price">{formatCRC(price)}</p>
            <div className="availability">
              <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `${product.stock} en stock total` : 'Agotado'}
              </span>
            </div>
          </div>

          <AddToCartButton
            product={product}
            appliedPrice={price}
            minimumOrder={minimumOrder}
            className="add-to-cart-btn--large"
          />

          {product.rating && (
            <div className="rating-section">
              <span className="rating-stars">★ {product.rating.toFixed(1)}</span>
              {product.reviews && (
                <span className="review-count">({product.reviews} reseñas)</span>
              )}
            </div>
          )}

          {product.description && (
            <div className="description-section">
              <p className="product-description">{product.description}</p>
            </div>
          )}

          <div className="info-grid">
            {product.categories && product.categories.length > 0 && (
              <div className="info-item">
                <span className="info-label">Categoría</span>
                <span className="info-value">{product.categories.join(', ')}</span>
              </div>
            )}
            {product.sku && (
              <div className="info-item">
                <span className="info-label">SKU</span>
                <span className="info-value">{product.sku}</span>
              </div>
            )}
          </div>

          {product.features && product.features.length > 0 && (
            <div className="features-section">
              <h3>Características principales</h3>
              <ul className="features-list">
                {product.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {product.specifications && product.specifications.length > 0 && (
        <div className="specifications-section">
          <h2>Especificaciones técnicas</h2>
          <div className="specifications-table">
            {product.specifications.map((spec, idx) => (
              <div key={idx} className="spec-row">
                <span className="spec-label">{spec.label}</span>
                <span className="spec-value">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="additional-info-section-modern">
        {product.warranty && (
          <div className="info-card-modern">
            <h3>Garantía</h3>
            <p className="info-card-content">{product.warranty}</p>
          </div>
        )}

        {product.multi_sede && (
          <div className="info-card-modern">
            <h3>Disponibilidad en sedes</h3>
            <ul className="sedes-list-modern">
              {BRANCHES.map((branch) => {
                const qty = getStockAtBranch(product, branch.id);
                return (
                  <li key={branch.id} className={qty === 0 ? 'sede-agotada' : ''}>
                    <span className="sede-name">{branch.name}</span>
                    {qty > 0 ? (
                      <span className="sede-qty">{qty} unidades</span>
                    ) : (
                      <span className="sede-qty-out">Agotado</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Solo se muestra a usuarios B2B: para un B2C no aplica. */}
        {isB2B && product.b2b_info && (
          <div className="info-card-modern">
            <h3>Condiciones mayoristas</h3>
            <div className="b2b-content">
              <p>
                <strong>Tu precio B2B:</strong>{' '}
                {formatCRC(product.b2b_info.wholesale_price)}
              </p>
              <p>
                <strong>Pedido mínimo:</strong> {product.b2b_info.minimum_order} unidades
              </p>
              {product.b2b_info.bulk_discount && (
                <p className="b2b-badge">✓ Descuentos por volumen disponibles</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}