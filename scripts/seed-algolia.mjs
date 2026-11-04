/**
 * Script de indexación de productos en Algolia.
 *
 * Uso:
 *   node scripts/seed-algolia.js
 *
 * Requisitos:
 *   - Un archivo .env en la raíz con VITE_ALGOLIA_APP_ID, VITE_ALGOLIA_API_KEY
 *     y opcionalmente VITE_ALGOLIA_INDEX_NAME.
 *   - El archivo data/products.json con los productos a indexar.
 *
 * Este script lee los productos, los transforma (añade objectID y
 * sedes_disponibles), los sube a Algolia y configura los atributos
 * de faceting, búsqueda y ranking.
 */

import algoliasearch from 'algoliasearch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

// En ES Modules no existen __filename ni __dirname, hay que reconstruirlos.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appId = process.env.VITE_ALGOLIA_APP_ID;
const apiKey = process.env.VITE_ALGOLIA_API_KEY;
const indexName = process.env.VITE_ALGOLIA_INDEX_NAME || 'grupo-06_products';

// Si faltan credenciales, cortamos antes de intentar conectar.
if (!appId || !apiKey) {
  console.error(' Error: Faltan variables de entorno');
  console.log('Crea un archivo .env con:');
  console.log('VITE_ALGOLIA_APP_ID=tu_app_id');
  console.log('VITE_ALGOLIA_API_KEY=tu_api_key');
  console.log('VITE_ALGOLIA_INDEX_NAME=grupo-06_products');
  process.exit(1);
}

console.log(` Conectando a Algolia con App ID: ${appId}`);
console.log(` Indexando en: ${indexName}`);

const client = algoliasearch(appId, apiKey);
const index = client.initIndex(indexName);

try {
  // data/products.json está un nivel arriba de este script.
  const dataPath = join(__dirname, '../data/products.json');
  console.log(` Leyendo datos de: ${dataPath}`);

  const data = readFileSync(dataPath, 'utf8');
  const jsonData = JSON.parse(data);

  // El JSON puede venir como { products: [...] } o como array directo.
  const products = jsonData.products || jsonData;

  if (!Array.isArray(products) || products.length === 0) {
    console.error(' No se encontraron productos en el archivo');
    process.exit(1);
  }

  console.log(` ${products.length} productos encontrados`);

  // Añade objectID (requerido por Algolia) y convierte multi_sede
  // en un array solo con las sedes que tienen stock > 0.
  const transformedProducts = products.map(product => {
    const sedes_disponibles = Object.entries(product.multi_sede || {})
      .filter(([, stock]) => stock > 0)
      .map(([sede]) => sede);

    return {
      ...product,
      objectID: product.id,
      sedes_disponibles,
    };
  });

  console.log(' Indexando productos...');
  const result = await index.saveObjects(transformedProducts);
  console.log(` ${result.objectIDs.length} productos indexados`);

  // Configura qué atributos se pueden filtrar, dónde se busca el texto
  // y cómo se ordenan los resultados por defecto.
  await index.setSettings({
    attributesForFaceting: ['categories', 'brand', 'price', 'b2b_info.bulk_discount', 'sedes_disponibles'],
    searchableAttributes: ['name', 'model', 'description', 'brand', 'categories'],
    customRanking: ['desc(rating)', 'desc(reviews)'],
  });

  console.log(' Configuración de Algolia actualizada');
  console.log(' Indexación completada!');

} catch (error) {
  console.error(' Error durante la indexación:', error.message);
  process.exit(1);
}