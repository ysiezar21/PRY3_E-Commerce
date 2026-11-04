import "./styles/index.js";
import { HashRouter } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import CartProvider from "./features/cart/CartProvider";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Raíz de la aplicación.
 *
 * Orden de los wrappers: ErrorBoundary atrapa cualquier error de render de
 * toda la app; HashRouter habilita la navegación; CartProvider expone el
 * carrito a todas las rutas; MainLayout define las rutas y el layout común.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <CartProvider>
          <MainLayout />
        </CartProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}