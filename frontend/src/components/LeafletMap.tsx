/**
 * LeafletMap — mapa real com tiles do OpenStreetMap e clustering de marcadores.
 *
 * Usa a API nativa do Leaflet (não react-leaflet) para ter controle total
 * sobre inicialização e limpeza, evitando erros de "container already used".
 * Utiliza leaflet.markercluster para agrupar pins próximos automaticamente.
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

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
  const clusterRef   = useRef<L.MarkerClusterGroup | null>(null);

  // ── Inicializa o mapa UMA vez ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Grupo de clustering — agrupa pins próximos e desagrupa ao dar zoom
    const cluster = L.markerClusterGroup({
      spiderfyOnMaxZoom:   true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius:    60,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        return L.divIcon({
          html: `<div style="
            width:40px;height:40px;
            background:linear-gradient(135deg,#2563EB,#3B82F6);
            border:3px solid #fff;
            border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            color:#fff;font-weight:700;font-size:13px;
            box-shadow:0 2px 8px rgba(37,99,235,.4);
          ">${count}</div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
      },
    });

    map.addLayer(cluster);
    mapRef.current   = map;
    clusterRef.current = cluster;

    return () => {
      map.remove();
      mapRef.current   = null;
      clusterRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Atualiza marcadores sempre que mudam ───────────────────────────────────
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: makePinIcon(m.color) });

      if (m.popupHtml) {
        marker.bindPopup(m.popupHtml, { maxWidth: 220 });
      }

      marker.on('click', () => {
        onMarkerClick?.(m.id);
        if (m.popupHtml) marker.openPopup();
      });

      cluster.addLayer(marker);
    });
  }, [markers, onMarkerClick]);

  // ── Expõe método de localizar usuário via ref no container ─────────────────
  useEffect(() => {
    const el = containerRef.current as HTMLElement & {
      _leafletLocate?: () => void;
      _leafletFlyTo?: (lat: number, lng: number, z?: number) => void;
    };
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
