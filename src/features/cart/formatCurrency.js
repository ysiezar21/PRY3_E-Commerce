/**
 * Formatea un número como colón costarricense sin decimales.
 *
 * Si el valor es null/undefined, se trata como 0.
 */
export const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(value ?? 0);