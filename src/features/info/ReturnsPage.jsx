import InfoPageLayout from './InfoPageLayout';

export default function ReturnsPage() {
  return (
    <InfoPageLayout
      title="Política de Devoluciones"
      intro="Queremos que quede conforme con su compra. Así funcionan las devoluciones en TechGrid."
    >
      <section>
        <h2>Plazo para solicitar una devolución</h2>
        <p>Dispone de 8 días naturales desde la recepción del producto.</p>
      </section>

      <section>
        <h2>Condiciones para aprobarla</h2>
        <ul>
          <li>Producto sin uso, sin instalar y en su empaque original con todos sus accesorios.</li>
          <li>Número de orden y comprobante de compra.</li>
          <li>Productos recibidos defectuosos o distintos a lo pedido se aprueban tras verificación.</li>
        </ul>
      </section>

      <section>
        <h2>Casos en los que no se aceptan</h2>
        <ul>
          <li>Componentes con señales de instalación, golpes o mal uso.</li>
          <li>Productos sin empaque original o con sellos de seguridad rotos.</li>
          <li>Solicitudes fuera del plazo.</li>
        </ul>
      </section>

      <section>
        <h2>Procedimiento</h2>
        <ol>
          <li>Escriba a soporte@techgrid.cr indicando su número de orden y el motivo.</li>
          <li>Evaluamos la solicitud y respondemos en un máximo de 3 días hábiles.</li>
          <li>Si se aprueba, coordinamos el retiro o la entrega del producto.</li>
          <li>Tras revisar el producto, reembolsamos el monto por el mismo medio de pago.</li>
        </ol>
      </section>
    </InfoPageLayout>
  );
}