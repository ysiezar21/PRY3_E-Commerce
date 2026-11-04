import InfoPageLayout from './InfoPageLayout';

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Política de Privacidad"
      intro="Explicamos qué datos usamos y para qué."
    >
      <section>
        <h2>Información que recopilamos</h2>
        <ul>
          <li>Datos del comprador: nombre, correo y teléfono.</li>
          <li>Datos de entrega: provincia, cantón, dirección e indicaciones.</li>
          <li>Datos de la compra: productos, montos y estado de la orden.</li>
        </ul>
      </section>

      <section>
        <h2>Uso de la información</h2>
        <ul>
          <li>Procesar y entregar sus pedidos.</li>
          <li>Contactarle sobre el estado de su orden o una devolución.</li>
          <li>No vendemos ni compartimos sus datos con terceros ajenos a la operación de la compra.</li>
        </ul>
      </section>

      <section>
        <h2>Protección de datos</h2>
        <ul>
          <li>Solo solicitamos los datos necesarios para completar la compra.</li>
          <li>El acceso a la información está limitado al personal que la necesita.</li>
          <li>No almacenamos datos de tarjetas: los pagos los procesa un proveedor externo.</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}