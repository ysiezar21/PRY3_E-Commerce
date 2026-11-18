import "./styles/index.js";
import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import { AuthProvider } from "./features/auth/AuthContext";
import CartProvider from "./features/cart/CartProvider";
import ErrorBoundary from "./components/ErrorBoundary";
import { syncLocalOrders } from "./features/orders/ordersService";

/**
 * Raíz de la aplicación.
 *
 * Orden de los wrappers: ErrorBoundary atrapa cualquier error de render de
 * toda la app; HashRouter habilita la navegación; CartProvider expone el
 * carrito a todas las rutas; MainLayout define las rutas y el layout común.
 */
export default function App() {
  // Al cargar la app se suben a Algolia las órdenes confirmadas que hayan quedado pendientes.
  useEffect(() => {
    syncLocalOrders();
  }, []);

  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <CartProvider>
            <MainLayout />
          </CartProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}