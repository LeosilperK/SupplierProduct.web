export interface ColaboradorSession {
  token: string;
  login: string;
  nome?: string | null;
  expiracao?: string | null;
  departamento?: 'fiscal' | 'compras' | null;
}

const AUTH_STORAGE_KEY = 'supplier-product-colaborador-auth';

export function saveColaboradorSession(session: ColaboradorSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getColaboradorSession(): ColaboradorSession | null {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as ColaboradorSession;
  } catch {
    clearColaboradorSession();
    return null;
  }
}

export function clearColaboradorSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

