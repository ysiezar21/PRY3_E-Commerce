/**
 * Detalle de una orden: "/ordenes/:orderNumber".
 *
 * Un cliente solo puede ver sus propias órdenes; el administrador puede ver
 * cualquiera. Si la orden no existe (o no es del usuario) se muestra el mismo
 * mensaje, para no revelar qué números de orden existen.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { PERMISSIONS } from '../features/auth/permissions';
import { fetchOrder } from '../features/orders/ordersService';
import OrderConfirmation from '../features/checkout/OrderConfirmation';
import StatusMessage from '../components/StatusMessage';
import '../styles/pages/OrdersPage.css';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { currentUser, can } = useAuth();
  const navigate = useNavigate();

  // El resultado guarda de qué orden es: si cambia el número, vuelve a mostrar "cargando".
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    fetchOrder(orderNumber).then((data) => {
      if (active) setResult({ orderNumber, ...data });
    });
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (result?.orderNumber !== orderNumber) {
    return <p className="orders-page__loading">Cargando la orden...</p>;
  }

  const { order, remoteFailed } = result;
  const isAdmin = can(PERMISSIONS.VIEW_ALL_ORDERS);
  const isOwner = Boolean(order?.user?.id) && order.user.id === currentUser?.objectID;
  const backTo = isAdmin ? '/admin' : '/ordenes';

  if (!order || !(isOwner || isAdmin)) {
    return (
      <StatusMessage
        tone="error"
        title="No encontramos esa orden"
        actions={
          <Link to={backTo} className="status-message__button">
            {isAdmin ? 'Volver al panel' : 'Ir a mis órdenes'}
          </Link>
        }
      >
        {remoteFailed
          ? `No pudimos consultar la orden ${orderNumber} porque el servicio de órdenes no respondió. Intente de nuevo en unos minutos.`
          : `La orden ${orderNumber} no existe o no pertenece a su cuenta. Revise el número e inténtelo de nuevo.`}
      </StatusMessage>
    );
  }

  return (
    <div className="orders-page orders-page--detail">
      <OrderConfirmation
        order={order}
        mode="detail"
        continueLabel={isAdmin ? 'Volver al panel' : 'Volver a mis órdenes'}
        onContinue={() => navigate(backTo)}
      />
    </div>
  );
}
