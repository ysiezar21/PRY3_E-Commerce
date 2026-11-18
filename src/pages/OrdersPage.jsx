/**
 * "Mis órdenes": lista de las órdenes confirmadas del usuario con sesión.
 *
 * Las órdenes se consultan en el índice de órdenes de Algolia (ver
 * features/orders/ordersService.js). Cada fila lleva al detalle de la orden.
 * Solo clientes B2C y B2B llegan aquí (ruta protegida con RequirePermission).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { fetchUserOrders } from '../features/orders/ordersService';
import { formatOrderDate } from '../features/orders/formatOrderDate';
import { formatCRC } from '../features/cart/formatCurrency';
import StatusMessage from '../components/StatusMessage';
import '../styles/pages/OrdersPage.css';

const countUnits = (order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.objectID;

  // El resultado guarda de quién es: si cambia el usuario, vuelve a mostrar "cargando".
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    fetchUserOrders(userId).then((data) => {
      if (active) setResult({ userId, ...data });
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (result?.userId !== userId) {
    return <p className="orders-page__loading">Cargando sus órdenes...</p>;
  }

  const { orders, remoteFailed } = result;

  if (orders.length === 0) {
    return (
      <StatusMessage
        title="Aún no tiene órdenes"
        actions={
          <Link to="/" className="status-message__button">
            Ir al catálogo
          </Link>
        }
      >
        {remoteFailed
          ? 'No pudimos consultar el servicio de órdenes en este momento. Intente de nuevo en unos minutos.'
          : 'Cuando complete una compra, la orden aparecerá aquí.'}
      </StatusMessage>
    );
  }

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <h1>Mis órdenes</h1>
        <p>
          {orders.length} {orders.length === 1 ? 'orden realizada' : 'órdenes realizadas'} con la
          cuenta de {currentUser.name}.
        </p>
      </header>

      {remoteFailed && (
        <p className="orders-page__notice" role="status">
          No pudimos consultar el servicio de órdenes. Se muestran las órdenes guardadas en este
          navegador.
        </p>
      )}

      <div className="orders-page__table-wrapper">
        <table className="orders-page__table">
          <thead>
            <tr>
              <th scope="col">Orden</th>
              <th scope="col">Fecha</th>
              <th scope="col">Productos</th>
              <th scope="col">Sucursal</th>
              <th scope="col">Total</th>
              <th scope="col">Estado de la orden</th>
              <th scope="col">Estado del pago</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.orderNumber}>
                <td>
                  <Link to={`/ordenes/${order.orderNumber}`}>{order.orderNumber}</Link>
                </td>
                <td>{formatOrderDate(order.date)}</td>
                <td>{countUnits(order)} uds</td>
                <td>{order.delivery?.branchName ?? '-'}</td>
                <td>{formatCRC(order.total)}</td>
                <td>{order.orderStatus}</td>
                <td>{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
