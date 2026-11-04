import { LOCATIONS } from './costaRicaLocations';

// Regex del nombre: letras (con tildes y ñ), apóstrofo, espacio y guion.
const NAME_REGEX = /^[A-Za-záéíóúüñ' -]+$/;
// Regex de email: algo@algo.algo con al menos 2 caracteres en el TLD.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Deja solo los dígitos del teléfono y quita el prefijo +506 si viene
export function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('506') ? digits.slice(3) : digits;
}

// Cada validador devuelve un mensaje de error, o '' si el campo es válido
const validators = {
  fullName: (value) => {
    // Normaliza espacios antes de validar (trim + colapsar espacios múltiples).
    const name = value.trim().replace(/\s+/g, ' ');
    if (!name) return 'Ingrese su nombre completo.';
    if (!NAME_REGEX.test(name)) return 'El nombre solo puede contener letras.';
    if (name.split(' ').length < 2) return 'Ingrese su nombre y apellido.';
    return '';
  },

  email: (value) => {
    const email = value.trim();
    if (!email) return 'Ingrese su correo electrónico.';
    if (!EMAIL_REGEX.test(email)) return 'Ingrese un correo válido, por ejemplo nombre@correo.com.';
    return '';
  },

  phone: (value) => {
    if (!value.trim()) return 'Ingrese su número de teléfono.';
    // Primero comprueba que solo haya caracteres válidos de teléfono...
    if (!/^[\d\s+()-]+$/.test(value)) return 'El teléfono solo puede contener números.';
    // ...y luego valida ya normalizado (sin +506) contra 8 dígitos que empiecen por 2-8.
    if (!/^[2-8]\d{7}$/.test(normalizePhone(value))) {
      return 'Ingrese un teléfono de 8 dígitos, por ejemplo 8888-8888.';
    }
    return '';
  },

  province: (value) => (value ? '' : 'Seleccione una provincia.'),

  // canton necesita `form` para comprobar que pertenece a la provincia elegida.
  canton: (value, form) => {
    if (!form.province) return 'Primero seleccione una provincia.';
    if (!value) return 'Seleccione un cantón.';
    if (!LOCATIONS[form.province]?.includes(value)) return 'El cantón no pertenece a la provincia.';
    return '';
  },

  address: (value) => {
    const address = value.trim();
    if (!address) return 'Ingrese su dirección de entrega.';
    if (address.length < 10) return 'Agregue más detalle a la dirección (distrito, calle, número de casa).';
    if (address.length > 200) return 'La dirección no puede superar los 200 caracteres.';
    return '';
  },

  // notes es opcional: solo valida el límite de longitud.
  notes: (value) => (value.length > 200 ? 'Las indicaciones no pueden superar los 200 caracteres.' : ''),
  acceptTerms: (value) => value ? '' : 'Debe aceptar los términos y condiciones para continuar.',
};

// Devuelve solo los campos con error: { campo: mensaje }
export function validateForm(form) {
  const errors = {};

  Object.keys(validators).forEach((name) => {
    // `?? ''` protege contra campos ausentes en el formulario.
    const message = validators[name](form[name] ?? '', form);
    if (message) errors[name] = message;
  });

  return errors;
}