import { searchClient, usersIndexName } from '../../config/algolia';

/**
 * Obtiene la lista de usuarios desde el índice de Algolia.
 * Como es un login simulado, traemos todos los registros (hitsPerPage: 100).
 */
export async function fetchUsers() {
  try {
    const index = searchClient.initIndex(usersIndexName);
    const { hits } = await index.search('', { hitsPerPage: 100 });
    return hits;
  } catch (error) {
    console.error('Error al cargar usuarios de Algolia:', error);
    throw new Error('No se pudieron cargar los usuarios. Revisa tu conexión.');
  }
}