/**
 * LeafletMap — mapa real com tiles do OpenStreetMap.
 *
 * Usa a API nativa do Leaflet (não react-leaflet) para ter controle total
 * sobre inicialização e limpeza, evitando erros de "container already used".
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Cor de fundo do pin (hex ou css color) */
  color: string;
  /** Texto do popup ao clicar no marcador */
  popupHtml?: string;
}

export interface LeafletMapProps {
  /** Centro inicial [lat, lng] — padrão: Av. Paulista, São Paulo */
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  className?: string;
  onMarkerClick?: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cria um ícone de pin circular colorido usando divIcon */
function makePinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:34px; height:34px;
        background:${color};
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 2px 10px rgba(0,0,0,.35);
        display:flex; align-items:center; justify-content:center;
      ">
        <div style="width:10px;height:10px;background:#fff;border-radius:50%;opacity:.85;"></div>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
}

// ── Componente ────────────────────────────────────────────────────────────────

export function LeafletMap({
  center = [-23.5505, -46.6333],
  zoom = 14,
  markers = [],
  className = '',
  onMarkerClick,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const layerRef     = useRef<L.LayerGroup | null>(null);

  // ── Inicializa o mapa UMA vez ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false, // controles customizados na UI
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current   = map;

    return () => {
      map.remove();
      mapRef.current  = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Atualiza marcadores sempre que mudam ───────────────────────────────────
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    layer.clearLayers();

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: makePinIcon(m.color) });

      if (m.popupHtml) {
        marker.bindPopup(m.popupHtml, { maxWidth: 220 });
      }

      marker.on('click', () => {
        onMarkerClick?.(m.id);
        if (m.popupHtml) marker.openPopup();
      });

      layer.addLayer(marker);
    });
  }, [markers, onMarkerClick]);

  // ── Expõe método de localizar usuário via ref no container ─────────────────
  // (chamado pelos botões de controle nas telas)
  useEffect(() => {
    const el = containerRef.current as HTMLElement & { _leafletLocate?: () => void; _leafletFlyTo?: (lat: number, lng: number, z?: number) => void };
    if (!el) return;
    el._leafletLocate = () => {
      mapRef.current?.locate({ setView: true, maxZoom: 16 });
    };
    el._leafletFlyTo = (lat, lng, z = 15) => {
      mapRef.current?.flyTo([lat, lng], z, { duration: 1 });
    };
  });

  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
