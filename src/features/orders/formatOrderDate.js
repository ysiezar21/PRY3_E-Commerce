// Fecha larga con hora, en formato costarricense (ej. "16 de octubre de 2026, 14:30").
export const formatOrderDate = (iso) =>
  new Intl.DateTimeFormat('es-CR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));
