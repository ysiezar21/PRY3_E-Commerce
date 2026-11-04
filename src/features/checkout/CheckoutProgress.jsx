const STEPS = ['Datos de entrega', 'Revisión y pago', 'Confirmación'];

// Indica en qué etapa de la compra está el usuario.
// current va de 1 a 3: los pasos anteriores quedan en verde como completados.
export default function CheckoutProgress({ current }) {
  return (
    // aria-label describe el conjunto; cada paso actual lleva aria-current="step".
    <ol className="checkout-progress" aria-label="Progreso de la compra">
      {STEPS.map((label, index) => {
        const number = index + 1;
        // Tres estados posibles según la posición respecto a `current`.
        const state = number < current ? 'done' : number === current ? 'current' : 'todo';

        return (
          <li
            key={label}
            className={`checkout-progress__item checkout-progress__item--${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            {/* El número es decorativo: el texto del label ya identifica el paso. */}
            <span className="checkout-progress__number" aria-hidden="true">
              {number}
            </span>
            <span className="checkout-progress__label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}