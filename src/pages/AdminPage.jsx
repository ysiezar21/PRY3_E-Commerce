/**
 * Panel administrativo.
 *
 * Solo se llega aquí con el rol ADMIN (la ruta está protegida con
 * RequirePermission en MainLayout). Por ahora muestra el acceso y las
 * secciones previstas; el contenido de cada una se agrega por separado.
 */
import '../styles/pages/AdminPage.css';

const SECTIONS = [
  { title: 'Órdenes', text: 'Consulta de todas las órdenes generadas.' },
  { title: 'Productos', text: 'Información del catálogo y precios B2C / B2B.' },
  { title: 'Inventario', text: 'Disponibilidad por sucursal.' },
];

export default function AdminPage() {
  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <span className="admin-page__tag">Acceso restringido</span>
        <h1>Panel administrativo</h1>
        <p>Consulta de órdenes, productos e inventario de la tienda.</p>
      </header>

      <ul className="admin-page__sections">
        {SECTIONS.map((section) => (
          <li key={section.title} className="admin-page__section">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            <span className="admin-page__soon">Próximamente</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
