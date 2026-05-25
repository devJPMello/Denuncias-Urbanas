/**
 * Base HTTP client — thin fetch wrapper with optional Bearer auth header.
 * All methods throw on non-2xx responses.
 */

// Em dev, usa URL relativa → Vite proxy encaminha /api/* → http://localhost:3000/api/*
// Em produção, defina VITE_API_URL=https://seu-backend.com/api (sem barra final)
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

// ── Internal request helper ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}${body ? `: ${body}` : ''}`);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, token?: string | null): Promise<T> {
    return request<T>(path, { method: 'GET' }, token);
  },

  post<T>(path: string, body: unknown, token?: string | null): Promise<T> {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token);
  },

  put<T>(path: string, body: unknown, token?: string | null): Promise<T> {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token);
  },

  delete<T>(path: string, token?: string | null): Promise<T> {
    return request<T>(path, { method: 'DELETE' }, token);
  },
};
