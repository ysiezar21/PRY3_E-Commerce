import InfoPageLayout from './InfoPageLayout';

export default function ShippingPage() {
  return (
    <InfoPageLayout
      title="Política de Envíos"
      intro="Entregamos tecnología en todo el país."
    >
      <section>
        <h2>Cobertura de entrega</h2>
        <p>Realizamos envíos a las 7 provincias de Costa Rica. No hacemos envíos internacionales.</p>
      </section>

      <section>
        <h2>Tiempos estimados</h2>
        <ul>
          <li>Gran Área Metropolitana: 1 a 3 días hábiles.</li>
          <li>Resto del país: 3 a 5 días hábiles.</li>
          <li>Los tiempos cuentan desde la confirmación de la orden.</li>
        </ul>
      </section>

      <section>
        <h2>Costos de envío</h2>
        <ul>
          <li>El envío cuesta el 3% del subtotal, con un mínimo de ₡2.500.</li>
          <li>Envío gratis en compras con subtotal desde ₡400.000.</li>
          <li>El costo se muestra antes de pagar.</li>
        </ul>
      </section>

      <section>
        <h2>Restricciones y condiciones especiales</h2>
        <ul>
          <li>La entrega requiere una dirección exacta y un teléfono de contacto válidos.</li>
          <li>Algunas zonas remotas pueden tardar más de lo estimado.</li>
          <li>Revise el paquete al recibirlo y repórtelo de inmediato si llega dañado.</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}