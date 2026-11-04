import { Link } from 'react-router-dom';
import logo from '../assets/techgrid-logo.png';
import { INFO_PAGES } from '../features/info/infoPages';

/**
 * Pie de página global con marca, eslogan, enlaces a las políticas y datos legales.
 */
export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <img src={logo} alt="TechGrid Distributions" className="app-footer__logo" />
        <p className="app-footer__slogan">Red Nacional de Suministros y Tecnología</p>
      </div>

      <nav className="app-footer__links" aria-label="Información comercial">
        {INFO_PAGES.map(({ to, title }) => (
          <Link key={to} to={to}>{title}</Link>
        ))}
      </nav>

      <div className="app-footer__legal">
        <p className="app-footer__copyright">
          © 2026 TechGrid Distributions S.A. — Distribución de Tecnología en Costa Rica
        </p>
        <p className="app-footer__note">Plataforma B2C / B2B — Proyecto IC-8063 Comercio Electrónico</p>
      </div>
    </footer>
  );
}