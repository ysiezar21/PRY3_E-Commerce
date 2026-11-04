import { useNavigate } from 'react-router-dom';

// Regresa a la página anterior; si se entró directo, va al catálogo
export default function BackButton() {
  const navigate = useNavigate();
  const canGoBack = window.history.state?.idx > 0;

  return (
    <button type="button" className="back-button" onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}>
      ← Volver
    </button>
  );
}
