import { Injectable, Logger } from '@nestjs/common';

export interface GeoCoords {
  lat: number;
  lng: number;
  displayName?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  addresstype?: string;
  type?: string;
  importance?: number;
}

/** Área aproximada de Palmas, TO */
const PALMAS_VIEWBOX = '-48.45,-10.35,-48.20,-10.10';

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  /** Converte endereço em coordenadas (servidor → sem bloqueio CORS). */
  async resolve(address: string): Promise<GeoCoords | null> {
    const trimmed = address.trim();
    if (trimmed.length < 3) return null;

    const query = trimmed.includes('Palmas')
      ? trimmed
      : `${trimmed}, Palmas, Tocantins, Brasil`;

    const results = await this.search(query);
    if (!results.length) return null;

    const token = this.extractQuadraToken(trimmed);
    const best = this.pickBestResult(results, token);
    if (!best) return null;

    const lat = Number(best.lat);
    const lng = Number(best.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng, displayName: best.display_name };
  }

  private async search(query: string): Promise<NominatimResult[]> {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json` +
      `&q=${encodeURIComponent(query)}` +
      `&limit=15` +
      `&viewbox=${PALMAS_VIEWBOX}` +
      `&bounded=1` +
      `&countrycodes=br`;

    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DenunciasUrbanas/1.0 (contact: admin@denunciasurbanas.com)',
        },
      });
      if (!res.ok) return [];
      return (await res.json()) as NominatimResult[];
    } catch (err) {
      this.logger.warn(`Nominatim falhou: ${(err as Error).message}`);
      return [];
    }
  }

  /** Ex.: "305 Sul", "103 Norte" */
  private extractQuadraToken(address: string): string | null {
    const m = address.match(/\b(\d{1,4})\s*(norte|sul|leste|oeste|no|ne|so|se)\b/i);
    if (!m) return null;
    return `${m[1]} ${m[2]}`.replace(/\s+/g, ' ');
  }

  private pickBestResult(results: NominatimResult[], token: string | null): NominatimResult | null {
    if (!token) {
      return (
        results.find((r) => r.addresstype === 'suburb') ??
        results.find((r) => r.type === 'suburb') ??
        results[0]
      );
    }

    const norm = token.toLowerCase();
    const wordRe = new RegExp(`\\b${norm.replace(/\s+/g, '\\s+')}\\b`, 'i');

    const scored = results.map((r) => {
      let score = (r.importance ?? 0) * 10;
      const name = `${r.name ?? ''} ${r.display_name ?? ''}`;

      if (r.name?.toLowerCase() === norm) score += 200;
      else if (wordRe.test(name)) score += 120;

      if (r.addresstype === 'suburb' || r.type === 'suburb') score += 40;
      if (r.addresstype === 'neighbourhood') score += 25;

      return { r, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.r ?? null;
  }
}
