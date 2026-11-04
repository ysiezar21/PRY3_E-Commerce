import { Link } from 'react-router-dom';
import { INFO_PAGES } from './infoPages';
import BackButton from './BackButton';

export default function InfoHubPage() {
  return (
    <section className="info-page">
      <BackButton />
      <h1>Centro de información</h1>
      <p className="info-page__intro">
        Consulte las condiciones y políticas de TechGrid Distributions.
      </p>

      <ul className="info-hub">
        {INFO_PAGES.map(({ to, title, text }) => (
          <li key={to}>
            <Link to={to} className="info-hub__card">
              <h2>{title}</h2>
              <p>{text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}