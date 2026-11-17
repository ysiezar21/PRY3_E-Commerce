/**
 * Layout principal de la aplicación.
 *
 * InstantSearch envuelve toda la app para que la búsqueda del Navbar
 * y el catálogo compartan el mismo estado de Algolia.
 *
 * Rutas:
 *   - "/"              → catálogo con filtros y paginación.
 *   - "/producto/:id"  → detalle de un producto.
 *   - "/carrito"       → carrito de compras.
 *   - "/checkout"      → proceso de compra.
 *   - "/admin"         → panel administrativo (solo rol ADMIN).
 *   "/carrito" y "/checkout" requieren un cliente B2C o B2B con sesión.
 *   - "/informacion"   → centro de información (índice de políticas).
 *   - "/terminos", "/devoluciones", "/envios", "/privacidad", "/faq"
 *                      → páginas informativas.
 *   - cualquier otra   → página 404.
 *
 * Las rutas van dentro de un ErrorBoundary: si una página falla, se muestra
 * un mensaje comprensible (con el Header y el Footer intactos) en lugar de
 * una pantalla en blanco. El error se limpia solo al cambiar de ruta.
 */

import { Routes, Route, useLocation } from "react-router-dom";
import { InstantSearch } from "react-instantsearch";
import { searchClient, indexName } from "../config/algolia";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";
import CatalogPage from "../features/catalog/CatalogPage";
import ProductDetail from "./ProductDetail";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import NotFoundPage from "./NotFoundPage";
import InfoHubPage from "../features/info/InfoHubPage";
import TermsPage from "../features/info/TermsPage";
import ReturnsPage from "../features/info/ReturnsPage";
import ShippingPage from "../features/info/ShippingPage";
import PrivacyPage from "../features/info/PrivacyPage";
import FaqPage from "../features/info/FaqPage";
import LoginPage from './LoginPage';
import AnalyticsPage from './AnalyticsPage';
import AdminPage from './AdminPage';
import RequirePermission from '../features/auth/RequirePermission';
import { PERMISSIONS } from '../features/auth/permissions';

export default function MainLayout() {
  const { pathname } = useLocation();

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <div className="App">
        <Header />
        <main className="app-main">
          <ErrorBoundary resetKey={pathname}>
            <Routes>
              <Route path="/" element={<CatalogPage />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              {/* Rutas protegidas por rol (RBAC): ver features/auth/permissions.js */}
              <Route
                path="/carrito"
                element={
                  <RequirePermission permission={PERMISSIONS.ADD_TO_CART} area="el carrito de compras">
                    <CartPage />
                  </RequirePermission>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequirePermission permission={PERMISSIONS.CHECKOUT} area="el proceso de compra">
                    <CheckoutPage />
                  </RequirePermission>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequirePermission permission={PERMISSIONS.VIEW_ADMIN_INFO} area="el panel administrativo">
                    <AdminPage />
                  </RequirePermission>
                }
              />
              <Route path="/informacion" element={<InfoHubPage />} />
              <Route path="/terminos" element={<TermsPage />} />
              <Route path="/devoluciones" element={<ReturnsPage />} />
              <Route path="/envios" element={<ShippingPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="*" element={<NotFoundPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </InstantSearch>
  );
}