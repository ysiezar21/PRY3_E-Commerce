import { useAuth } from '../auth/AuthContext';
import { getHistory } from './analyticsService';
import { Link } from 'react-router-dom';

export default function RecentlyViewed() {
  const { currentUser } = useAuth();
  const { viewed } = getHistory(currentUser);

  if (!viewed || viewed.length === 0) return null;

  return (
    <div className="recently-viewed-section">
      <h3 className="personalization-title">Vistos recientemente</h3>
      <div className="personalization-scroll">
        {viewed.reverse().slice(-3).reverse().map((product) => (
          <Link to={`/producto/${product.id}`} key={product.id} className="mini-product-card">
            <p className="mini-product-name">{product.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}