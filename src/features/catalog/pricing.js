/**
 * Utilidades de precios para el catálogo.
 * 
 * Determina el precio correcto (B2C o B2B) basándose en el rol del usuario
 * y en la información del producto.
 */

export function getPricingForUser(product, currentUser) {
  // Si no hay usuario o es B2C, usamos el precio normal
  if (!currentUser || currentUser.role !== 'B2B') {
    return {
      price: product.price,
      isB2B: false,
      minimumOrder: 1,
    };
  }

  // Si es B2B, verificamos que el producto tenga la info B2B
  const b2bInfo = product.b2b_info || {};
  
  // Si por alguna razón no tiene precio B2B, le mostramos el B2C (fallback)
  if (!b2bInfo.wholesale_price) {
    return {
      price: product.price,
      isB2B: false,
      minimumOrder: 1,
    };
  }

  return {
    price: b2bInfo.wholesale_price,
    isB2B: true,
    minimumOrder: b2bInfo.minimum_order || 1,
  };
}