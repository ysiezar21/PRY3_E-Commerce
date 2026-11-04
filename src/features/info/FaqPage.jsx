import InfoPageLayout from './InfoPageLayout';

const FAQS = [
  { topic: 'Compras', q: '¿Cómo realizo una compra?', a: 'Agregue productos al carrito, complete sus datos de entrega, acepte los términos, revise su pedido y pague.' },
  { topic: 'Pagos', q: '¿Qué métodos de pago aceptan?', a: 'Procesamos el pago durante el checkout mediante nuestro proveedor de pagos. Verá el resultado antes de que la orden se confirme.' },
  { topic: 'Pagos', q: '¿Qué pasa si mi pago es rechazado?', a: 'Su orden no se confirma y no se le cobra. Puede reintentar el pago desde la pantalla de revisión.' },
  { topic: 'Envíos', q: '¿Cuánto tarda mi pedido?', a: 'De 1 a 3 días hábiles en la GAM y de 3 a 5 en el resto del país.' },
  { topic: 'Envíos', q: '¿Cuánto cuesta el envío?', a: 'El 3% del subtotal (mínimo ₡2.500). Es gratis desde ₡400.000.' },
  { topic: 'Devoluciones', q: '¿Puedo devolver un producto?', a: 'Sí, dentro de 8 días naturales, sin uso y en su empaque original. Vea la Política de Devoluciones.' },
  { topic: 'Atención al cliente', q: '¿Cómo contacto a soporte?', a: 'Escríbanos a soporte@techgrid.cr con su número de orden, de lunes a viernes de 8 a. m. a 5 p. m. Le responderemos en un máximo de 3 días hábiles.' },
];

export default function FaqPage() {
  return (
    <InfoPageLayout title="Preguntas Frecuentes" intro="Respuestas rápidas a las dudas más comunes.">
      <div className="faq">
        {FAQS.map(({ topic, q, a }) => (
          <details key={q} className="faq__item">
            <summary>
              <span className="faq__topic">{topic}</span> {q}
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </InfoPageLayout>
  );
}