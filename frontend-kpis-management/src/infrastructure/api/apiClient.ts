/**
 * Cliente HTTP centralizado para todas las peticiones a la API.
 * En cada petición:
 * - Añade el header Authorization cuando existe token.
 * - Si la respuesta es 401, elimina el token y redirige a /login.
 * Las rutas que requieren autenticación deben usar requireAuth: true para no enviar la petición sin token.
 */

const TOKEN_KEY = 'token';
const AUTH_HEADER = 'Authorization';

function clearSessionAndRedirect(): never {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '/login';
  throw new Error('Sesión expirada o no autorizado');
}

export interface RequestOptions extends RequestInit {
  /** Si true, la petición no se envía sin token y se redirige a login */
  requireAuth?: boolean;
}

/**
 * Realiza una petición HTTP. En cada llamada se aplica token y manejo 401.
 */
export async function request(url: string, init: RequestInit = {}, options: { requireAuth?: boolean } = {}): Promise<Response> {
  const { requireAuth = false } = options;
  const token = localStorage.getItem(TOKEN_KEY);

  if (requireAuth && !token) {
    clearSessionAndRedirect();
  }

  const headers = new Headers(init.headers as HeadersInit);
  if (!headers.has('Content-Type') && (init.body !== undefined && init.body !== null)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set(AUTH_HEADER, `Bearer ${token}`);
  }

  const response = await fetch(url, { ...init, headers });

  if (response.status === 401) {
    clearSessionAndRedirect();
  }

  return response;
}

export const apiClient = { request };
