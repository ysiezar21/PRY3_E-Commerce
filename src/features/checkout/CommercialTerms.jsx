import { ROLE_INFO } from '../auth/permissions';
import { getPriceTypeLabel } from '../catalog/pricing';
import { GUEST_ROLE, getCommercialConditions } from '../orders/orderModel';

const ROLE_LABELS = {
  [GUEST_ROLE]: 'Invitado (sin sesión)',
  B2C: ROLE_INFO.B2C.label,
  B2B: ROLE_INFO.B2B.label,
  ADMIN: ROLE_INFO.ADMIN.label,
};

const MIXED_LABEL = 'Mixto: precio mayorista con precio público en productos sin precio mayorista válido';

// Muestra quién compra y bajo qué condiciones comerciales: rol, empresa (B2B),
// lista de precios aplicada y mínimos B2B. Se usa en la revisión y en la confirmación.
//   user:  { role, company } tal como se guarda en la orden.
//   lines: productos con { name, quantity, priceType, minimumOrder }.
export default function CommercialTerms({ user, lines }) {
  const { priceList, minimums } = getCommercialConditions(lines);

  return (
    <div className="order-review__block">
      <h3>Cliente y condiciones comerciales</h3>
      <dl className="order-review__data">
        <dt>Rol</dt>
        <dd>{ROLE_LABELS[user.role] ?? user.role}</dd>

        {user.company && (
          <>
            <dt>Empresa</dt>
            <dd>{user.company}</dd>
          </>
        )}

        <dt>Precios</dt>
        <dd>{priceList === 'MIXED' ? MIXED_LABEL : getPriceTypeLabel(priceList)}</dd>

        {minimums.length > 0 && (
          <>
            <dt>Pedido mínimo B2B</dt>
            <dd>
              <ul className="order-review__list">
                {minimums.map((line) => (
                  <li key={line.name}>
                    {line.name}: mínimo {line.minimumOrder} uds (compra: {line.quantity})
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
