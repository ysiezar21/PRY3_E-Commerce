/**
 * Página de checkout.
 *
 * Solo se puede entrar con al menos un producto en el carrito;
 * si está vacío se muestra el mismo estado vacío del carrito.
 * Paso 1: formulario de comprador y entrega junto al resumen del carrito.
 * Paso 2: revisión final y pago con el servicio Sandbox.
 *         Con el pago aprobado, una pantalla intermedia crea la orden con otro
 *         servicio Sandbox (que puede confirmarla, rechazarla o fallar).
 * Paso 3: confirmación, solo si el pago fue aprobado Y la orden se confirmó.
 *
 * El carrito se vacía únicamente cuando la orden queda confirmada.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../features/cart/CartContext';
import { getCartSummary } from '../features/cart/cartCalculations';
import CartSummary from '../features/cart/CartSummary';
import CartEmptyState from '../features/cart/CartEmptyState';
import CheckoutForm from '../features/checkout/CheckoutForm';
import CheckoutProgress from '../features/checkout/CheckoutProgress';
import OrderReview from '../features/checkout/OrderReview';
import PaymentSection, { PaymentAlert } from '../features/checkout/PaymentSection';
import OrderConfirmation from '../features/checkout/OrderConfirmation';
import OrderStep from '../features/checkout/OrderStep';
import { createOrder, abandonOrder, isAwaitingOrder, ORDER_STATUS } from '../features/orders/orderModel';
import { saveOrder, findAwaitingOrder } from '../features/orders/orderStorage';
import { payOrder } from '../features/orders/payOrder';
import { fulfillOrder } from '../features/orders/fulfillOrder';
import { PAYMENT_RESULTS } from '../services/paymentSandbox';
import { ORDER_RESULTS } from '../services/orderSandbox';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  province: '',
  canton: '',
  address: '',
  notes: '',
  acceptTerms: false,
};

// Rellena el formulario con los datos de una orden ya guardada
const formFromOrder = ({ buyer, delivery, termsAccepted }) => ({
  fullName: buyer.fullName,
  email: buyer.email,
  phone: buyer.phone,
  province: delivery.province,
  canton: delivery.canton,
  address: delivery.address,
  notes: delivery.notes,
  // Las órdenes guardadas antes de este cambio no tienen termsAccepted
  acceptTerms: termsAccepted?.accepted ?? false,
});

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  // Si quedó una orden con el pago aprobado sin terminar de crear (por ejemplo, tras
  // recargar la página), se retoma en lugar de cobrar otra vez.
  const [order, setOrder] = useState(() => findAwaitingOrder(items));
  const [form, setForm] = useState(() => (order ? formFromOrder(order) : EMPTY_FORM));
  const [reviewing, setReviewing] = useState(() => Boolean(order));
  const [scenario, setScenario] = useState(PAYMENT_RESULTS.APPROVED);
  const [orderScenario, setOrderScenario] = useState(ORDER_RESULTS.CONFIRMED);
  const [processing, setProcessing] = useState(false);

  // Va antes del chequeo de carrito vacío: al confirmarse la orden, el carrito se vacía
  if (order?.orderStatus === ORDER_STATUS.CONFIRMED) {
    return (
      <div className="checkout-page">
        <CheckoutProgress current={3} />
        <OrderConfirmation order={order} onContinue={() => navigate('/')} />
      </div>
    );
  }

  if (items.length === 0) {
    return <CartEmptyState />;
  }

  const summary = getCartSummary(items);

  // Si cambian los datos, el próximo pago crea una orden nueva
  const discardOrder = () => {
    if (order) saveOrder(abandonOrder(order));
    setOrder(null);
  };

  const goToReview = (value) => {
    if (!value) discardOrder();
    setReviewing(value);
    window.scrollTo(0, 0);
  };

  const backToCart = () => {
    discardOrder();
    navigate('/carrito');
  };

  const handlePay = async () => {
    if (processing) return;
    setProcessing(true);

    // Al reintentar se usa la misma orden
    const currentOrder = order ?? createOrder({ buyer: form, items, summary });
    const updated = await payOrder(currentOrder, scenario);

    // Un pago aprobado aún no confirma la orden: el carrito se conserva hasta crearla
    setOrder(updated);
    setProcessing(false);
    window.scrollTo(0, 0);
  };

  // Crea la orden tras el pago aprobado. No vuelve a cobrar.
  const handleCreateOrder = async () => {
    if (processing) return;
    setProcessing(true);

    const updated = await fulfillOrder(order, orderScenario);

    setOrder(updated);
    setProcessing(false);
    if (updated.orderStatus === ORDER_STATUS.CONFIRMED) clearCart();
    window.scrollTo(0, 0);
  };

  // Con el pago aprobado, falta crear la orden
  if (isAwaitingOrder(order)) {
    return (
      <div className="checkout-page">
        <CheckoutProgress current={2} />
        <OrderStep
          order={order}
          scenario={orderScenario}
          onScenarioChange={setOrderScenario}
          processing={processing}
          onCreate={handleCreateOrder}
        />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <h1>Finalizar compra</h1>
        <button className="back-button" onClick={backToCart} disabled={processing}>
          ← Volver al carrito
        </button>
      </div>

      <CheckoutProgress current={reviewing ? 2 : 1} />

      {reviewing && !processing && <PaymentAlert order={order} />}

      {reviewing ? (
        <OrderReview
          items={items}
          buyer={form}
          summary={summary}
          onEdit={() => goToReview(false)}
          editDisabled={processing}
        >
          <PaymentSection
            scenario={scenario}
            onScenarioChange={setScenario}
            total={summary.total}
            order={order}
            processing={processing}
            onPay={handlePay}
          />
        </OrderReview>
      ) : (
        <div className="checkout-page__content">
          <CheckoutForm values={form} onChange={setForm} onSubmit={() => goToReview(true)} />
          <CartSummary {...summary} />
        </div>
      )}
    </div>
  );
}
