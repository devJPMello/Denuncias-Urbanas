import { api } from '../services/api';

export interface GeoCoords {
  lat: number;
  lng: number;
  displayName?: string;
}

/** Endereço → coordenadas via API (geocoding no servidor, sem CORS). */
export async function forwardGeocode(
  address: string,
  token?: string | null,
): Promise<GeoCoords | null> {
  const trimmed = address.trim();
  if (trimmed.length < 3) return null;

  try {
    return await api.get<GeoCoords>(
      `/denuncias/geocode-preview?address=${encodeURIComponent(trimmed)}`,
      token,
    );
  } catch {
    return null;
  }
}

/** Coordenadas → endereço (ainda via Nominatim no cliente; só para label após GPS). */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
      {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DenunciasUrbanas/1.0',
        },
      },
    );
    if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}
