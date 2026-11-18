/**
 * Órdenes en Algolia (índice de órdenes).
 *
 * Cada orden confirmada se guarda como un registro cuyo objectID es el número
 * de orden. Desde ahí se consultan "Mis órdenes" y el detalle de una orden.
 *
 * Las órdenes también se guardan en localStorage (orderStorage.js), que es lo
 * que permite retomar el pago tras recargar la página. Si Algolia no responde,
 * la consulta cae a esas órdenes locales en lugar de dejar la pantalla vacía.
 *
 * Ninguna función de este archivo lanza errores: devuelven un resultado para
 * que la pantalla pueda explicar qué pasó.
 */

import { searchClient, ordersIndexName } from '../../config/algolia';
import { ORDER_STATUS } from './orderModel';
import { getOrder, listOrders } from './orderStorage';

const getIndex = () => searchClient.initIndex(ordersIndexName);

// Campos que Algolia agrega a los resultados de búsqueda; no forman parte de la orden.
const SEARCH_FIELDS = ['_highlightResult', '_snippetResult', '_rankingInfo', '_distinctSeqID'];

// Registro que se guarda en Algolia: la orden, con su número como objectID y la
// fecha también como número, para poder ordenar por fecha en el índice.
function toRecord(order) {
  return {
    ...order,
    objectID: order.orderNumber,
    dateTimestamp: new Date(order.date).getTime(),
  };
}

function fromRecord(record) {
  const order = { ...record };
  SEARCH_FIELDS.forEach((field) => delete order[field]);
  return order;
}

// Escapa comillas y diagonales para usar un valor dentro de un filtro de Algolia.
const escapeFilterValue = (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

// Guarda (o reemplaza) la orden en el índice. Devuelve { ok }.
export async function saveOrderToAlgolia(order) {
  try {
    await getIndex().saveObject(toRecord(order));
    return { ok: true };
  } catch (error) {
    console.error('No se pudo guardar la orden en Algolia:', error);
    return { ok: false };
  }
}

// Órdenes confirmadas del usuario, de la más reciente a la más antigua.
// Devuelve { orders, remoteFailed }; remoteFailed indica que Algolia no respondió y
// que solo se muestran las órdenes guardadas en este navegador.
export async function fetchUserOrders(userId) {
  const localOrders = listOrders().filter(
    (order) => order.orderStatus === ORDER_STATUS.CONFIRMED && order.user?.id === userId
  );

  let remoteOrders = [];
  let remoteFailed = false;

  try {
    const { hits } = await getIndex().search('', {
      filters: `user.id:"${escapeFilterValue(userId)}"`,
      hitsPerPage: 100,
    });
    remoteOrders = hits.map(fromRecord);
  } catch (error) {
    console.error('No se pudieron consultar las órdenes en Algolia:', error);
    remoteFailed = true;
  }

  if (!remoteFailed) {
    // Una orden confirmada cuyo guardado en Algolia falló (por ejemplo, sin conexión
    // en ese momento) se vuelve a enviar aquí, ya que Algolia sí está disponible.
    const indexed = new Set(remoteOrders.map((order) => order.orderNumber));
    localOrders
      .filter((order) => !indexed.has(order.orderNumber))
      .forEach((order) => saveOrderToAlgolia(order));
  }

  // Si una orden está en los dos lados, se usa la de Algolia.
  const byNumber = new Map();
  [...localOrders, ...remoteOrders].forEach((order) => byNumber.set(order.orderNumber, order));

  const orders = [...byNumber.values()].sort((a, b) => b.date.localeCompare(a.date));
  return { orders, remoteFailed };
}

// Busca una orden por su número.
// Devuelve { order, remoteFailed }; order es null si la orden no existe.
export async function fetchOrder(orderNumber) {
  let remoteFailed = false;

  try {
    const record = await getIndex().getObject(orderNumber);
    return { order: fromRecord(record), remoteFailed };
  } catch (error) {
    // 404 = la orden no está en el índice; cualquier otro error es un fallo del servicio.
    if (error?.status !== 404) {
      console.error('No se pudo consultar la orden en Algolia:', error);
      remoteFailed = true;
    }
  }

  const local = getOrder(orderNumber);
  const order = local?.orderStatus === ORDER_STATUS.CONFIRMED ? local : null;
  return { order, remoteFailed };
}
