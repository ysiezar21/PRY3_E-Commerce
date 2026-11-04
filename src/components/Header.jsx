/**
 * Navbar principal: logo (enlace al catálogo), búsqueda de Algolia,
 * enlace de ayuda al centro de información e indicador del carrito,
 * que abre el menú lateral (CartDrawer).
 * Estilos en styles/components/Header.css y CartIndicator.css.
 */
import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { useAuth } from '../features/auth/AuthContext';
import CartDrawer from '../features/cart/CartDrawer';
import SearchBar from '../features/catalog/components/SearchBar';
import logo from '../assets/techgrid-logo.png';

export default function Header() {
  const { totalItems } = useCart();
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const { navigate } = useNavigate();

  // Sin distracciones durante la compra
  const inCheckout = pathname === '/checkout';

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Al salir, mandamos al login
  };

  return (
    <>
      <header className="App-header">
        <div className="navbar">
          <Link to="/" className="navbar__brand" aria-label="TechGrid Distributions, ir al catálogo">
            <img
              src={logo}
              alt="TechGrid Distributions"
              className="navbar__logo"
            />
          </Link>

          {!inCheckout && (
            <>
              <div className="navbar__search">
                <SearchBar />
              </div>

              <div className="navbar__actions">

                <div className="navbar__user-zone">
                  {currentUser ? (
                    <>
                      <div className="navbar__user-info">
                        <span className="navbar__user-name">
                          {currentUser.name}
                          <span className={`navbar__role-badge navbar__role-badge--${currentUser.role.toLowerCase()}`}>
                            {currentUser.role}
                          </span>
                        </span>
                        
                        {currentUser.role === 'ADMIN' && (
                          <Link to="/admin" className="navbar__admin-link">Panel Admin</Link>
                        )}
                      </div>
                      <button onClick={handleLogout} className="navbar__logout" title="Cerrar sesión">
                        Salir
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="navbar__login-link">Iniciar Sesión</Link>
                  )}
                </div>

                <Link to="/informacion" className="navbar__help" aria-label="Ayuda y políticas">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="navbar__help-text">Ayuda</span>
                </Link>

                <button
                  type="button"
                  className="cart-indicator"
                  onClick={() => setDrawerOpen(true)}
                  aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? 'unidad' : 'unidades'}`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  <span className="cart-indicator__count">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Fuera del <header> para no heredar sus estilos */}
      <CartDrawer open={drawerOpen} onClose={closeDrawer} />
    </>
  );
}
