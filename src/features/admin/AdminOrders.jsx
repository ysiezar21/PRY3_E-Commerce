/**
 * Panel administrativo: consulta de todas las órdenes.
 *
 * Las órdenes salen del índice de órdenes de Algolia (fetchAllOrders). Se puede
 * buscar por número de orden, cliente o empresa, y filtrar por tipo de cliente.
 * Cada número de orden lleva al detalle de la orden.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllOrders } from '../orders/ordersService';
import { formatOrderDate } from '../orders/formatOrderDate';
import { formatCRC } from '../cart/formatCurrency';
import { GUEST_ROLE } from '../orders/orderModel';
import '../../styles/pages/OrdersPage.css';

// Tipo de cliente que se muestra según el rol guardado en la orden.
const CLIENT_TYPES = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'B2C', label: 'Cliente B2C' },
  { value: 'B2B', label: 'Cliente B2B' },
  { value: GUEST_ROLE, label: 'Invitado' },
];

const TYPE_LABELS = Object.fromEntries(CLIENT_TYPES.map((type) => [type.value, type.label]));

// Las órdenes guardadas antes de existir el campo user no tienen rol: se tratan como B2C.
const getRole = (order) => order.user?.role ?? 'B2C';

const getClientName = (order) => order.user?.name ?? order.buyer?.fullName ?? '-';

export default function AdminOrders() {
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    fetchAllOrders().then((data) => {
      if (active) setResult(data);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!result) return [];
    const text = query.trim().toLowerCase();

    return result.orders.filter((order) => {
      if (typeFilter !== 'ALL' && getRole(order) !== typeFilter) return false;
      if (!text) return true;
      return [order.orderNumber, getClientName(order), order.user?.company]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(text));
    });
  }, [result, query, typeFilter]);

  if (!result) {
    return <p className="orders-page__loading">Cargando las órdenes...</p>;
  }

  const { orders, remoteFailed } = result;

  return (
    <section className="admin-section" aria-labelledby="admin-orders-title">
      <h2 id="admin-orders-title">Órdenes</h2>
      <p className="admin-section__intro">
        {orders.length} {orders.length === 1 ? 'orden registrada' : 'órdenes registradas'}.
      </p>

      {remoteFailed && (
        <p className="orders-page__notice" role="status">
          No pudimos consultar el servicio de órdenes. Solo se muestran las órdenes guardadas en
          este navegador.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="admin-section__empty">Todavía no se ha generado ninguna orden.</p>
      ) : (
        <>
          <div className="admin-section__filters">
            <label>
              <span>Buscar</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Número de orden, cliente o empresa"
              />
            </label>
            <label>
              <span>Tipo de cliente</span>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                {CLIENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="admin-section__empty">Ninguna orden coincide con la búsqueda.</p>
          ) : (
            <div className="orders-page__table-wrapper">
              <table className="orders-page__table">
                <thead>
                  <tr>
                    <th scope="col">Orden</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Tipo</th>
                    <th scope="col">Empresa</th>
                    <th scope="col">Total</th>
                    <th scope="col">Sucursal</th>
                    <th scope="col">Estado de la orden</th>
                    <th scope="col">Estado del pago</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.orderNumber}>
                      <td>
                        <Link to={`/ordenes/${order.orderNumber}`}>{order.orderNumber}</Link>
                      </td>
                      <td>{formatOrderDate(order.date)}</td>
                      <td>{getClientName(order)}</td>
                      <td>{TYPE_LABELS[getRole(order)] ?? getRole(order)}</td>
                      <td>{order.user?.company ?? '-'}</td>
                      <td>{formatCRC(order.total)}</td>
                      <td>{order.delivery?.branchName ?? '-'}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
