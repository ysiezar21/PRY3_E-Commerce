/**
 * Sucursales y utilidades de multi-inventario.
 *
 * Los productos en Algolia tienen la forma:
 *   multi_sede: { san_jose: 19, heredia: 14, cartago: 22, liberia: 5 }
 * Estas funciones abstraen esa estructura para no repetirla en la UI.
 */

export const BRANCHES = [
  { id: 'san_jose', name: 'San José' },
  { id: 'heredia', name: 'Heredia' },
  { id: 'cartago', name: 'Cartago' },
  { id: 'liberia', name: 'Liberia' },
];

// Stock de un producto en una sucursal específica (0 si no hay datos).
export function getStockAtBranch(product, branchId) {
  if (!product || !product.multi_sede || !branchId) return 0;
  return product.multi_sede[branchId] ?? 0;
}

// Suma de stock en todas las sucursales.
export function getTotalStock(product) {
  if (!product) return 0;
  if (!product.multi_sede) return product.stock ?? 0;
  return Object.values(product.multi_sede).reduce((sum, n) => sum + n, 0);
}

// Sucursales donde el producto tiene al menos 1 unidad.
export function getBranchesWithStock(product) {
  if (!product || !product.multi_sede) return [];
  return BRANCHES.filter((b) => (product.multi_sede[b.id] ?? 0) > 0);
}

// Nombre legible de una sucursal por su id.
export function getBranchName(branchId) {
  return BRANCHES.find((b) => b.id === branchId)?.name ?? '—';
}