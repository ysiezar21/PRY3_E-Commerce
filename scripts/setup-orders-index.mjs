/**
 * Script de configuración del índice de órdenes en Algolia.
 *
 * Uso:
 *   npm run setup-orders-index
 *
 * Qué hace: crea el índice de órdenes (si no existe) y configura:
 *   - user.id como atributo filtrable, que es lo que usa "Mis órdenes" para
 *     traer solo las órdenes del usuario con sesión.
 *   - los atributos en los que se busca texto.
 *   - el orden por defecto: las órdenes más recientes primero.
 *
 * Las órdenes en sí NO se cargan aquí: la aplicación las guarda cuando una
 * compra queda confirmada.
 *
 * Requisitos:
 *   - Un archivo .env en la raíz con VITE_ALGOLIA_APP_ID y una API key con
 *     permiso de escritura (VITE_ALGOLIA_API_KEY, la misma de seed-algolia, o
 *     ALGOLIA_ADMIN_API_KEY si se prefiere usar otra).
 *   - Opcional: VITE_ALGOLIA_ORDERS_INDEX_NAME (por defecto grupo-06_orders).
 */

import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

const appId = process.env.VITE_ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_ADMIN_API_KEY || process.env.VITE_ALGOLIA_API_KEY;
const indexName = process.env.VITE_ALGOLIA_ORDERS_INDEX_NAME || 'grupo-06_orders';

// Si faltan credenciales, cortamos antes de intentar conectar.
if (!appId || !apiKey) {
  console.error(' Error: Faltan variables de entorno');
  console.log('Crea un archivo .env con:');
  console.log('VITE_ALGOLIA_APP_ID=tu_app_id');
  console.log('VITE_ALGOLIA_API_KEY=tu_api_key_con_permiso_de_escritura');
  process.exit(1);
}

console.log(` Conectando a Algolia con App ID: ${appId}`);
console.log(` Configurando el índice: ${indexName}`);

try {
  const client = algoliasearch(appId, apiKey);
  const index = client.initIndex(indexName);

  // setSettings crea el índice si todavía no existe.
  await index
    .setSettings({
      attributesForFaceting: ['filterOnly(user.id)', 'filterOnly(orderStatus)'],
      searchableAttributes: ['orderNumber', 'user.name', 'user.email', 'user.company', 'delivery.branchName'],
      customRanking: ['desc(dateTimestamp)'],
    })
    .wait();

  console.log(' Índice de órdenes configurado');
} catch (error) {
  console.error(' Error al configurar el índice:', error.message);
  console.error(' Si dice que la clave no tiene permiso, usa una API key con permiso de escritura (Admin).');
  process.exit(1);
}
