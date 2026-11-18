/**
 * Datos del catálogo para el panel administrativo.
 *
 * - fetchProducts: trae todos los productos del índice de Algolia.
 * - Cambios de precio simulados: se guardan en localStorage, no en Algolia.
 *   Cada cambio queda en un historial con el valor anterior y el nuevo.
 */
import { searchClient, indexName } from '../../config/algolia';

const CHANGES_KEY = 'techgrid-admin-price-changes';

// Campos de precio que el administrador puede modificar.
export const PRICE_FIELDS = {
  price: 'Precio B2C',
  wholesale_price: 'Precio B2B',
};

// Trae el catálogo completo (300 productos) en una sola consulta. Devuelve { ok, products }.
export async function fetchProducts() {
  try {
    const { hits } = await searchClient.initIndex(indexName).search('', {
      hitsPerPage: 1000,
      attributesToRetrieve: ['id', 'name', 'categories', 'category', 'price', 'b2b_info', 'multi_sede', 'stock'],
      attributesToHighlight: [],
    });
    return { ok: true, products: hits };
  } catch (error) {
    console.error('No se pudo cargar el catálogo:', error);
    return { ok: false, products: [] };
  }
}

export function loadChanges() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHANGES_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function saveChanges(changes) {
  try {
    localStorage.setItem(CHANGES_KEY, JSON.stringify(changes));
  } catch {
    // Sin almacenamiento disponible: el cambio dura hasta recargar la página.
  }
}

// Aplica los cambios simulados sobre los productos de Algolia.
// Los productos con cambios quedan marcados con modified = true.
export function applyChanges(products, changes) {
  return products.map((product) => {
    const own = changes.filter((change) => change.productId === product.objectID);
    if (own.length === 0) return product;

    const updated = { ...product, b2b_info: { ...product.b2b_info }, modified: true };
    own.forEach((change) => {
      if (change.field === 'price') updated.price = change.newValue;
      else updated.b2b_info.wholesale_price = change.newValue;
    });
    return updated;
  });
}

// Mismas reglas que el catálogo (features/catalog/pricing.js). Devuelve '' si es válido.
export function validatePrices(price, wholesalePrice) {
  if (!(price > 0)) return 'El precio B2C debe ser mayor que 0.';
  if (!(wholesalePrice > 0)) return 'El precio B2B debe ser mayor que 0.';
  if (wholesalePrice >= price) return 'El precio B2B debe ser menor que el precio B2C.';
  return '';
}

// Texto de categoría para las tablas.
export const getCategoryLabel = (product) =>
  product.categories?.join(', ') || product.category || 'Sin categoría';

// Filtra por nombre, categoría o código del producto.
export function matchesQuery(product, query) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  return [product.name, getCategoryLabel(product), product.objectID]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(text));
}
