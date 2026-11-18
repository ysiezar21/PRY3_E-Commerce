/**
 * Panel administrativo: consulta de productos.
 *
 * PENDIENTE: esta sección todavía no está implementada.
 *
 * Qué debe mostrar (enunciado, "Consulta de productos"): una tabla con el
 * catálogo y, como mínimo, por producto:
 *   - nombre (name) y categoría
 *   - precio B2C           → product.price
 *   - precio B2B           → product.b2b_info.wholesale_price
 *   - mínimo de compra B2B → product.b2b_info.minimum_order
 *
 * De dónde sacar los productos: del índice de productos de Algolia
 * (searchClient e indexName de src/config/algolia.js) o de data/products.json.
 * Un producto sin precio válido debe mostrarse con aviso, no romper la tabla
 * (ver las reglas de features/catalog/pricing.js).
 *
 * Operación simulada (enunciado, "Administración simulada"): al menos una,
 * por ejemplo cambiar un precio. Se guarda en localStorage (no en Algolia) y
 * la pantalla debe mostrar qué se cambió: valor anterior y valor nuevo.
 *
 * Estilos: usar las clases admin-section__* y orders-page__table de
 * styles/pages/AdminPage.css y OrdersPage.css.
 */
export default function AdminProducts() {
  return (
    <section className="admin-section" aria-labelledby="admin-products-title">
      <h2 id="admin-products-title">Productos</h2>
      <p className="admin-section__intro">Información del catálogo y precios B2C / B2B.</p>
      <span className="admin-page__soon">Próximamente</span>
    </section>
  );
}
