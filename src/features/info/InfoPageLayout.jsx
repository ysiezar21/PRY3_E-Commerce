import BackButton from './BackButton';

export default function InfoPageLayout({ title, intro, children }) {
  return (
    <article className="info-page">
      <BackButton />
      <h1>{title}</h1>
      {intro && <p className="info-page__intro">{intro}</p>}
      {children}
    </article>
  );
}
