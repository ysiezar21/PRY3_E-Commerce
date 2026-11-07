import { useAuth } from '../auth/AuthContext';
import { getHistory } from './analyticsService';
import { useSearchBox } from 'react-instantsearch';
import { useLocation, useNavigate } from 'react-router-dom';

export default function RecentSearches() {
  const { currentUser } = useAuth();
  const { searches } = getHistory(currentUser);
  const { refine } = useSearchBox();
  const navigate = useNavigate();
  const location = useLocation();

  if (!searches || searches.length === 0) return null;

  const handleSearchClick = (term) => {
    refine(term);
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <div className="recent-searches-section">
      <h3 className="personalization-title">Búsquedas recientes</h3>
      <div className="personalization-pills">
        {searches.reverse().slice(-3).reverse().map((term, i) => (
          <button key={i} onClick={() => handleSearchClick(term)} className="search-pill">
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}