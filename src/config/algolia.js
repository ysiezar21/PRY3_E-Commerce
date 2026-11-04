/**
 * Cliente de Algolia para el frontend.
 *
 * Exporta:
 *   - searchClient: instancia lista para pasar a <InstantSearch>.
 *   - indexName: nombre del índice a consultar.
 *
 * Requiere en el .env:
 *   VITE_ALGOLIA_APP_ID=...
 *   VITE_ALGOLIA_API_KEY=...
 *   VITE_ALGOLIA_INDEX_NAME=...
 *
 */

import algoliasearch from 'algoliasearch';

// Vite expone al frontend solo las variables con prefijo VITE_.
const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_API_KEY;

// Aviso temprano si faltan credenciales, para no fallar más adelante
// con un error confuso.
if (!appId || !apiKey) {
  console.warn('Variables de entorno de Algolia no configuradas');
  console.warn('Crea un archivo .env con:');
  console.warn('VITE_ALGOLIA_APP_ID=tu_app_id');
  console.warn('VITE_ALGOLIA_API_KEY=tu_api_key');
}

export const searchClient = algoliasearch(appId, apiKey);
export const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'grupo-06_products';