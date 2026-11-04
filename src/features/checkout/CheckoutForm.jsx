import { useState } from 'react';
import { LOCATIONS, PROVINCES } from './costaRicaLocations';
import { validateForm } from './checkoutValidation';
import { Link } from 'react-router-dom';

// Formulario con los datos del comprador y la entrega.
// El estado de los valores vive en CheckoutPage; aquí se validan y se editan.
export default function CheckoutForm({ values, onChange, onSubmit }) {
  // touched: campos que el usuario ya visitó (para no mostrar errores antes de tiempo).
  // submitted: intento de envío; activa la visualización de todos los errores.
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // La validación se recalcula en cada render a partir de los valores actuales.
  const errors = validateForm(values);
  const errorCount = Object.keys(errors).length;

  // Un error se muestra cuando el usuario ya salió del campo o intentó continuar
  const errorFor = (name) => (touched[name] || submitted ? errors[name] : '');

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };

    // Al cambiar de provincia el cantón elegido antes ya no aplica
    if (name === 'province') next.canton = '';

    onChange(next);
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Si hay errores no se avanza y el foco va al primer campo con problema
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      document.getElementById(`checkout-${firstError}`)?.focus();
      return;
    }

    onSubmit();
  };

  // Atributos comunes de cada campo (id, value, handlers y aria de error).
  const fieldProps = (name) => ({
    id: `checkout-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    // aria-invalid + aria-describedby enlazan el campo con su mensaje de error.
    'aria-invalid': Boolean(errorFor(name)),
    'aria-describedby': errorFor(name) ? `checkout-${name}-error` : undefined,
  });

  // role="alert" anuncia el error en cuanto aparece.
  const renderError = (name) =>
    errorFor(name) ? (
      <p id={`checkout-${name}-error`} className="checkout-form__error" role="alert">
        {errorFor(name)}
      </p>
    ) : null;

  // noValidate: se desactiva la validación nativa del navegador; la maneja validateForm.
  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      {/* Resumen de errores solo tras intentar enviar. */}
      {submitted && errorCount > 0 && (
        <p className="checkout-form__alert" role="alert">
          Revise los campos marcados, hay {errorCount} por corregir.
        </p>
      )}

      <fieldset className="checkout-form__section">
        <legend>Información del comprador</legend>

        <div className="checkout-form__field">
          <label htmlFor="checkout-fullName">Nombre completo</label>
          <input {...fieldProps('fullName')} type="text" autoComplete="name" />
          {renderError('fullName')}
        </div>

        <div className="checkout-form__row">
          <div className="checkout-form__field">
            <label htmlFor="checkout-email">Correo electrónico</label>
            <input {...fieldProps('email')} type="email" autoComplete="email" />
            {renderError('email')}
          </div>

          <div className="checkout-form__field">
            <label htmlFor="checkout-phone">Teléfono</label>
            <input {...fieldProps('phone')} type="tel" autoComplete="tel" />
            {renderError('phone')}
          </div>
        </div>
      </fieldset>

      <fieldset className="checkout-form__section">
        <legend>Información de entrega</legend>

        <div className="checkout-form__row">
          <div className="checkout-form__field">
            <label htmlFor="checkout-province">Provincia</label>
            <select {...fieldProps('province')}>
              <option value="">Seleccione una provincia</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {renderError('province')}
          </div>

          <div className="checkout-form__field">
            <label htmlFor="checkout-canton">Cantón</label>
            {/* El cantón depende de la provincia: deshabilitado hasta elegir una. */}
            <select {...fieldProps('canton')} disabled={!values.province}>
              <option value="">Seleccione un cantón</option>
              {/* Fallback a [] si la provincia no tiene cantones mapeados. */}
              {(LOCATIONS[values.province] ?? []).map((canton) => (
                <option key={canton} value={canton}>
                  {canton}
                </option>
              ))}
            </select>
            {renderError('canton')}
          </div>
        </div>

        <div className="checkout-form__field">
          <label htmlFor="checkout-address">Dirección exacta</label>
          <textarea {...fieldProps('address')} rows={3} autoComplete="street-address" />
          {renderError('address')}
        </div>

        <div className="checkout-form__field">
          <label htmlFor="checkout-notes">
            Indicaciones adicionales para la entrega{' '}
            <span className="checkout-form__optional">(opcional)</span>
          </label>
          <textarea {...fieldProps('notes')} rows={2} />
          {renderError('notes')}
        </div>
      </fieldset>


      <div className="checkout-form__field checkout-form__terms">
        <label htmlFor="checkout-acceptTerms">
          <input
            id="checkout-acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={values.acceptTerms}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errorFor('acceptTerms'))}
            aria-describedby={errorFor('acceptTerms') ? 'checkout-acceptTerms-error' : undefined}
          />
          <span>
            He leído y acepto los{' '}
            <Link to="/terminos" target="_blank" rel="noopener noreferrer">
              términos y condiciones
            </Link>
          </span>
        </label>
        {renderError('acceptTerms')}
      </div>

      <button type="submit" className="checkout-form__submit">
        Continuar a revisión
      </button>
    </form>
  );
}