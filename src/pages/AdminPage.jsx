/**
 * Panel administrativo.
 *
 * Solo se llega aquí con el rol ADMIN (la ruta está protegida con
 * RequirePermission en MainLayout). Cada sección es una pestaña con su propio
 * componente en features/admin/; para agregar una sección basta con crear el
 * componente y añadirlo a TABS.
 */
import { useState } from 'react';
import AdminOrders from '../features/admin/AdminOrders';
import AdminProducts from '../features/admin/AdminProducts';
import AdminInventory from '../features/admin/AdminInventory';
import '../styles/pages/AdminPage.css';

const TABS = [
  { id: 'orders', label: 'Órdenes', Section: AdminOrders },
  { id: 'products', label: 'Productos', Section: AdminProducts },
  { id: 'inventory', label: 'Inventario', Section: AdminInventory },
];

export default function AdminPage() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const { Section } = TABS.find((tab) => tab.id === activeId);

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <span className="admin-page__tag">Acceso restringido</span>
        <h1>Panel administrativo</h1>
        <p>Consulta de órdenes, productos e inventario de la tienda.</p>
      </header>

      <div className="admin-page__tabs" role="tablist" aria-label="Secciones del panel">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`admin-tab-${tab.id}`}
            aria-selected={tab.id === activeId}
            aria-controls="admin-tabpanel"
            className={`admin-page__tab${tab.id === activeId ? ' admin-page__tab--active' : ''}`}
            onClick={() => setActiveId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="admin-tabpanel" role="tabpanel" aria-labelledby={`admin-tab-${activeId}`}>
        <Section />
      </div>
    </div>
  );
}
