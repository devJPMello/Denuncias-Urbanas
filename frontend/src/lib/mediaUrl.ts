import { API_BASE_URL } from '../services/api';

/** URL da foto armazenada no banco (GET /api/denuncias/:id/imagem). */
export function resolveDenunciaImageUrl(
  id: string,
  temImagem?: boolean,
  imagemUrl?: string | null,
): string | undefined {
  if (temImagem || imagemUrl?.includes('/imagem')) {
    return `${API_BASE_URL}/denuncias/${id}/imagem`;
  }
  return resolveMediaUrl(imagemUrl);
}

/**
 * Legado: caminhos /uploads/... no disco (denúncias antigas).
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  const path = url.startsWith('/') ? url : `/${url}`;

  if (API_BASE_URL.startsWith('http')) {
    const origin = API_BASE_URL.replace(/\/api$/, '');
    return `${origin}${path}`;
  }

  return path;
}
