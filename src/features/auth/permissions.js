/**
 * Control de acceso basado en roles (RBAC) a nivel de interfaz.
 *
 * La aplicación pregunta "¿este usuario puede hacer X?" con can(), en lugar
 * de comparar roles a mano en cada componente. Así la matriz de permisos
 * vive en un solo lugar y coincide con la del enunciado.
 */

export const ROLES = {
  B2C: 'B2C',
  B2B: 'B2B',
  ADMIN: 'ADMIN',
};

export const PERMISSIONS = {
  VIEW_CATALOG: 'VIEW_CATALOG',
  SEARCH_PRODUCTS: 'SEARCH_PRODUCTS',
  ADD_TO_CART: 'ADD_TO_CART',
  CHECKOUT: 'CHECKOUT',
  VIEW_OWN_ORDERS: 'VIEW_OWN_ORDERS',
  VIEW_ALL_ORDERS: 'VIEW_ALL_ORDERS',
  VIEW_ADMIN_INFO: 'VIEW_ADMIN_INFO',
  ADMIN_SIMULATION: 'ADMIN_SIMULATION',
};

const P = PERMISSIONS;

// Lo que puede hacer cualquier visitante, tenga sesión o no.
const PUBLIC_PERMISSIONS = [P.VIEW_CATALOG, P.SEARCH_PRODUCTS];

// B2C y B2B comparten permisos: lo que cambia entre ellos son los precios y
// las condiciones comerciales, no las pantallas disponibles.
const CUSTOMER_PERMISSIONS = [...PUBLIC_PERMISSIONS, P.ADD_TO_CART, P.CHECKOUT, P.VIEW_OWN_ORDERS];

export const ROLE_PERMISSIONS = {
  [ROLES.B2C]: CUSTOMER_PERMISSIONS,
  [ROLES.B2B]: CUSTOMER_PERMISSIONS,
  [ROLES.ADMIN]: [...PUBLIC_PERMISSIONS, P.VIEW_ALL_ORDERS, P.VIEW_ADMIN_INFO, P.ADMIN_SIMULATION],
};

// Textos para mostrar el rol y el tipo de usuario en la interfaz.
export const ROLE_INFO = {
  [ROLES.B2C]: { label: 'Cliente B2C', userType: 'Consumidor final' },
  [ROLES.B2B]: { label: 'Cliente B2B', userType: 'Empresa' },
  [ROLES.ADMIN]: { label: 'Administrador', userType: 'Personal interno' },
};

export function isValidRole(role) {
  return Object.hasOwn(ROLE_PERMISSIONS, role);
}

// Un usuario es válido si tiene identificador, nombre y un rol conocido.
export function isValidUser(user) {
  return Boolean(user && user.objectID && user.name && isValidRole(user.role));
}

export function can(user, permission) {
  if (!isValidUser(user)) return PUBLIC_PERMISSIONS.includes(permission);
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function getRoleInfo(user) {
  return ROLE_INFO[user?.role] ?? { label: 'Sin rol', userType: 'Desconocido' };
}
