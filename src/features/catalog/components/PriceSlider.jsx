/**
 * Filtro de precio con doble slider (mínimo y máximo).
 *
 * Usa useRange de react-instantsearch, que devuelve:
 *   - range: { min, max } del atributo en todo el índice.
 *   - start: [min, max] actualmente aplicados como filtro.
 *   - refine: aplica un nuevo rango a Algolia.
 *
 * Restricción: la distancia entre el thumb izquierdo y el derecho
 * nunca puede ser menor a MIN_GAP (₡5000). Si el rango total del
 * índice es menor, el gap se adapta para no trabar los thumbs.
 */

import { useState, useEffect, useRef } from 'react';
import { useRange } from 'react-instantsearch';

// Formatea un número como colón costarricense sin decimales.
const formatCRC = (value) =>
  new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

// Distancia mínima permitida entre los dos thumbs.
const MIN_GAP = 5000;

const PriceSlider = ({ attribute }) => {
  const { range, start, refine, canRefine } = useRange({ attribute });
  const { min, max } = range;

  // Si el índice no cubre al menos MIN_GAP de rango, usar el rango
  // completo como gap efectivo para que los thumbs no se traben.
  const totalRange = (max ?? 0) - (min ?? 0);
  const effectiveGap = Math.min(MIN_GAP, Math.max(totalRange, 0));

  const currentMin = Number.isFinite(start[0]) ? start[0] : min;
  const currentMax = Number.isFinite(start[1]) ? start[1] : max;

  const [values, setValues] = useState([currentMin ?? 0, currentMax ?? 0]);

  // Sincroniza el estado local con Algolia solo cuando el filtro cambia
  // desde fuera (navegación, recarga). Sin esta guarda, el useEffect se
  // dispararía en cada movimiento del thumb y sobrescribiría el valor
  // que el usuario acaba de elegir, anulando el MIN_GAP.
  const startKey = `${currentMin}-${currentMax}`;
  const lastKeyRef = useRef(startKey);

  useEffect(() => {
    if (lastKeyRef.current !== startKey) {
      lastKeyRef.current = startKey;
      setValues([currentMin ?? 0, currentMax ?? 0]);
    }
  }, [startKey, currentMin, currentMax]);

  // Si el atributo no se puede filtrar o tiene un solo valor, no renderizar.
  if (!canRefine || min === max) return null;

  // El thumb izquierdo no puede acercarse al derecho a menos de effectiveGap.
  const handleMinChange = (e) => {
    const raw = Number(e.target.value);
    const newMin = Math.min(raw, values[1] - effectiveGap);
    setValues([newMin, values[1]]);
  };

  // El thumb derecho no puede acercarse al izquierdo a menos de effectiveGap.
  const handleMaxChange = (e) => {
    const raw = Number(e.target.value);
    const newMax = Math.max(raw, values[0] + effectiveGap);
    setValues([values[0], newMax]);
  };

  // Aplica el filtro a Algolia solo al soltar el thumb, no en cada
  // movimiento, para evitar peticiones innecesarias.
  const handleCommit = () => {
    refine([values[0], values[1]]);
  };

  // Posición porcentual de cada thumb para pintar la barra activa.
  const minPercent = ((values[0] - min) / (max - min)) * 100;
  const maxPercent = ((values[1] - min) / (max - min)) * 100;

  return (
    <div className="price-slider-container">
      <div className="price-slider">
        <div className="price-track-bg" />
        {/* Barra morada entre los dos thumbs */}
        <div
          className="price-track"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={values[0]}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="price-thumb price-thumb-min"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={values[1]}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="price-thumb price-thumb-max"
        />
      </div>
      <div className="price-values">
        <span className="price-min">{formatCRC(values[0])}</span>
        <span className="price-max">{formatCRC(values[1])}</span>
      </div>
    </div>
  );
};

export default PriceSlider;