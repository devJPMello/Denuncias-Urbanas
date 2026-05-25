/**
 * Base HTTP client — thin fetch wrapper com Bearer auth header e timeout.
 * Todos os métodos lançam erro em respostas não-2xx.
 */

// Em dev, usa URL relativa → Vite proxy encaminha /api/* → http://localhost:3000/api/*
// Em produção, defina VITE_API_URL=https://seu-backend.com/api (sem barra final)
const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

const DEFAULT_TIMEOUT_MS = 10_000; // 10 segundos

// ── Internal request helper ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${body ? `: ${body}` : ''}`);
    }

    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('A requisição excedeu o tempo limite. Verifique sua conexão.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ── Multipart (sem Content-Type — deixa o browser definir o boundary) ─────────

async function requestMultipart<T>(
  path: string,
  body: FormData,
  token?: string | null,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000); // 30s para uploads

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method:  'POST',
      headers,
      body,
      signal:  controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ''}`);
    }

    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Upload excedeu o tempo limite.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
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

  /** Upload de arquivo multipart/form-data. */
  upload<T>(path: string, formData: FormData, token?: string | null): Promise<T> {
    return requestMultipart<T>(path, formData, token);
  },
};
