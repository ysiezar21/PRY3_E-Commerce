import InfoPageLayout from './InfoPageLayout';

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Términos y Condiciones"
      intro="Versión 1.0 — octubre 2026. Al usar TechGrid Distributions y realizar una compra, usted acepta estos términos."
    >
      <section>
        <h2>1. Condiciones de uso del sitio</h2>
        <ul>
          <li>El sitio es para uso personal o empresarial lícito.</li>
          <li>No se permite alterar su funcionamiento ni intentar acceder a áreas no autorizadas.</li>
          <li>Podemos actualizar el catálogo, precios y estas condiciones sin previo aviso.</li>
        </ul>
      </section>

      <section>
        <h2>2. Condiciones generales de compra</h2>
        <ul>
          <li>Los precios se muestran en colones costarricenses (CRC). El IVA (13%) y el envío se detallan en el resumen de compra.</li>
          <li>La compra se confirma cuando el pago es aprobado y la orden queda creada.</li>
          <li>La disponibilidad depende del inventario al momento de la compra.</li>
          <li>Las compras empresariales o al por mayor siguen las condiciones B2B (precio mayorista y pedido mínimo) indicadas en cada producto.</li>
        </ul>
      </section>

      <section>
        <h2>3. Responsabilidades del cliente</h2>
        <ul>
          <li>Proporcionar datos de contacto y entrega correctos y completos.</li>
          <li>Revisar el pedido antes de pagar.</li>
          <li>Usar los productos conforme a sus especificaciones.</li>
        </ul>
      </section>

      <section>
        <h2>4. Responsabilidades de la tienda</h2>
        <ul>
          <li>Entregar los productos adquiridos según lo descrito en el catálogo.</li>
          <li>Proteger los datos del cliente conforme a la Política de Privacidad.</li>
          <li>Atender consultas y solicitudes de devolución dentro de los plazos publicados.</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}