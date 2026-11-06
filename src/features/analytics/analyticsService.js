/**
 * Servicio de Analytics basado en localStorage.
 * 
 * Registra eventos (login, búsqueda, view, cart, checkout, purchase)
 * y mantiene un historial separado para personalización.
 * 
 * Todos los datos están scopeados por usuario usando su objectID.
 */

const EVENTS_KEY = 'techgrid_analytics_events';
const HISTORY_KEY = 'techgrid_analytics_history';

// --- Utilidades internas ---

function getUserId(user) {
  return user?.objectID || 'guest';
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('No se pudo guardar analytics', e);
  }
}

// --- Eventos ---

export function trackEvent(type, payload = {}, currentUser = null) {
  const events = loadJSON(EVENTS_KEY, []);
  const newEvent = {
    id: Date.now() + Math.random().toString(36).substr(2, 5), // ID único
    type, // 'LOGIN' | 'SEARCH' | 'VIEW_PRODUCT' | 'ADD_TO_CART' | 'START_CHECKOUT' | 'PURCHASE'
    timestamp: new Date().toISOString(),
    userId: getUserId(currentUser),
    payload, // Datos específicos (ej. término de búsqueda, nombre del producto, total)
  };
  
  // Guardamos el evento (mantenemos solo los últimos 200 para no llenar el storage)
  events.push(newEvent);
  saveJSON(EVENTS_KEY, events.slice(-200));
}

export function getEvents(currentUser = null) {
  const events = loadJSON(EVENTS_KEY, []);
  const userId = getUserId(currentUser);
  return events.filter(e => e.userId === userId);
}

// --- Historial para Personalización ---

export function trackProductView(product, currentUser = null) {
  const history = loadJSON(HISTORY_KEY, {});
  const userId = getUserId(currentUser);
  
  if (!history[userId]) history[userId] = { viewed: [], searches: [] };
  
  // Evitamos duplicados recientes: si ya estaba, lo movemos al inicio.
  history[userId].viewed = history[userId].viewed.filter(p => p.id !== product.id);
  history[userId].viewed.unshift({
    id: product.id,
    name: product.name,
    image: product.images?.[0] || null,
    price: product.price,
    timestamp: new Date().toISOString()
  });
  
  // Mantener solo los últimos 10
  history[userId].viewed = history[userId].viewed.slice(0, 10);
  saveJSON(HISTORY_KEY, history);
  
  // También registramos el evento formal
  trackEvent('VIEW_PRODUCT', { productId: product.id, name: product.name }, currentUser);
}

export function trackSearch(term, currentUser = null) {
  if (!term || term.trim().length < 2) return;
  const history = loadJSON(HISTORY_KEY, {});
  const userId = getUserId(currentUser);
  
  if (!history[userId]) history[userId] = { viewed: [], searches: [] };
  
  const cleanTerm = term.trim().toLowerCase();
  history[userId].searches = history[userId].searches.filter(t => t !== cleanTerm);
  history[userId].searches.unshift(cleanTerm);
  history[userId].searches = history[userId].searches.slice(0, 5);
  
  saveJSON(HISTORY_KEY, history);
  trackEvent('SEARCH', { term: cleanTerm }, currentUser);
}

export function getHistory(currentUser = null) {
  const history = loadJSON(HISTORY_KEY, {});
  const userId = getUserId(currentUser);
  return history[userId] || { viewed: [], searches: [] };
}

// --- Métricas (Dashboard) ---

export function getMetrics(currentUser = null) {
  const events = getEvents(currentUser);
  
  return {
    productsViewed: events.filter(e => e.type === 'VIEW_PRODUCT').length,
    searches: events.filter(e => e.type === 'SEARCH').length,
    addedToCart: events.filter(e => e.type === 'ADD_TO_CART').length,
    purchases: events.filter(e => e.type === 'PURCHASE').length,
    // Extra útil para el dashboard
    logins: events.filter(e => e.type === 'LOGIN').length,
    checkoutsStarted: events.filter(e => e.type === 'START_CHECKOUT').length,
  };
}