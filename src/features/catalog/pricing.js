/**
 * Precios según el rol del usuario.
 *
 * - B2C (o sin sesión): precio público, mínimo 1 unidad.
 * - B2B: precio mayorista y pedido mínimo del producto.
 * - Precio público inválido (falta, 0 o negativo): el producto no se vende.
 * - Precio mayorista inválido (falta, 0 o mayor/igual al público):
 *   al B2B se le cobra el precio público y se le avisa.
 */

export const PRICE_TYPES = { B2C: 'B2C', B2B: 'B2B' };

const PRICE_TYPE_LABELS = {
  B2C: 'Precio público (B2C)',
  B2B: 'Precio mayorista (B2B)',
};

export const getPriceTypeLabel = (priceType) => PRICE_TYPE_LABELS[priceType];

// Válido = número mayor que cero.
const isValidPrice = (value) => typeof value === 'number' && value > 0;

// Resultado con el precio público (B2C).
const publicPrice = (product, notice = '') => ({
  price: product.price,
  priceType: PRICE_TYPES.B2C,
  isB2B: false,
  minimumOrder: 1,
  isValid: true,
  notice,
});

export function getPricingForUser(product, currentUser) {
  if (!isValidPrice(product?.price)) {
    return { ...publicPrice(product), price: null, isValid: false, notice: 'Precio no disponible' };
  }

  if (currentUser?.role !== 'B2B') {
    return publicPrice(product);
  }

  const b2bInfo = product.b2b_info || {};

  if (!isValidPrice(b2bInfo.wholesale_price) || b2bInfo.wholesale_price >= product.price) {
    return publicPrice(product, 'Sin precio mayorista válido: se aplica el precio público');
  }

  return {
    price: b2bInfo.wholesale_price,
    priceType: PRICE_TYPES.B2B,
    isB2B: true,
    minimumOrder: b2bInfo.minimum_order > 1 ? b2bInfo.minimum_order : 1,
    isValid: true,
    notice: '',
  };
}
