import { useAuth } from '../features/auth/AuthContext';
import { getMetrics } from '../features/analytics/analyticsService';

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const metrics = getMetrics(currentUser);

  const cards = [
    { title: 'Productos visualizados', value: metrics.productsViewed },
    { title: 'Búsquedas realizadas', value: metrics.searches },
    { title: 'Agregados al carrito', value: metrics.addedToCart },
    { title: 'Compras realizadas', value: metrics.purchases },
  ];

  return (
    <div className="analytics-page" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Resumen de tu Actividad</h1>
      <p style={{ color: '#666' }}>Estas métricas se calculan localmente con base en tu uso de la plataforma.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {cards.map((c) => (
          <div key={c.title} style={{ background: '#fff', border: '1px solid #e5e4e7', borderRadius: '12px', padding: '24px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{c.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e' }}>{c.value}</div>
            <div style={{ fontSize: '14px', color: '#6b6b73', marginTop: '4px' }}>{c.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}