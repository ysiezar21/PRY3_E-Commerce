/**
 * Panel administrativo: consulta de inventario por sucursal.
 *
 * PENDIENTE: esta sección todavía no está implementada.
 *
 * Qué debe mostrar (enunciado, "Consulta de inventario"): la disponibilidad
 * de cada producto en cada sucursal.
 *   - Estructura: product.multi_sede = { san_jose: 19, heredia: 14, ... }
 *   - Sucursales: BRANCHES de features/branches/branches.js
 *   - Utilidades: getStockAtBranch() y getTotalStock() en el mismo archivo
 *
 * Marcar de forma visible los productos sin stock en una sucursal (0 unidades).
 *
 * Si la operación simulada del panel es cambiar un stock, esa operación puede
 * vivir aquí: se guarda en localStorage (no en Algolia) y se muestra qué
 * cambió, con valor anterior y valor nuevo.
 *
 * Estilos: usar las clases admin-section__* y orders-page__table de
 * styles/pages/AdminPage.css y OrdersPage.css.
 */
export default function AdminInventory() {
  return (
    <section className="admin-section" aria-labelledby="admin-inventory-title">
      <h2 id="admin-inventory-title">Inventario</h2>
      <p className="admin-section__intro">Disponibilidad por sucursal.</p>
      <span className="admin-page__soon">Próximamente</span>
    </section>
  );
}
