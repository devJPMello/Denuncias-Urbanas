/**
 * LocationPickerMap — mini-mapa para ajuste fino de localização.
 *
 * • Exibe um marcador arrastável na posição inicial.
 * • Desenha um círculo de precisão (GPS accuracy em metros).
 * • Chama onPositionChange sempre que o marcador é solto.
 * • Permite clicar no mapa para reposicionar o pin.
 */
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocationPickerMapProps {
  lat:       number;
  lng:       number;
  accuracy?: number;                              // metros (círculo azul)
  className?: string;
  onPositionChange: (lat: number, lng: number) => void;
}

/** Pin arrastável (vermelho com ponto branco) */
function makeDraggablePin(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:38px; height:38px;
        background:#EF4444;
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 3px 12px rgba(0,0,0,.4);
        display:flex; align-items:center; justify-content:center;
        cursor:grab;
      ">
        <div style="width:10px;height:10px;background:#fff;border-radius:50%;opacity:.9;"></div>
      </div>`,
    iconSize:   [38, 38],
    iconAnchor: [19, 19],
  });
}

export function LocationPickerMap({
  lat,
  lng,
  accuracy,
  className = '',
  onPositionChange,
}: LocationPickerMapProps) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<L.Map | null>(null);
  const markerRef      = useRef<L.Marker | null>(null);
  const circleRef      = useRef<L.Circle | null>(null);
  const onChangeRef    = useRef(onPositionChange);
  onChangeRef.current  = onPositionChange;

  // ── Inicializa o mapa UMA vez ──────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center:           [lat, lng],
      zoom:             17,
      zoomControl:      true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Marcador arrastável
    const marker = L.marker([lat, lng], {
      icon:     makeDraggablePin(),
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const { lat: newLat, lng: newLng } = marker.getLatLng();
      onChangeRef.current(newLat, newLng);
    });

    // Clicar no mapa move o pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    // Círculo de precisão
    const circle = accuracy
      ? L.circle([lat, lng], {
          radius:      accuracy,
          color:       '#3B82F6',
          fillColor:   '#3B82F6',
          fillOpacity: 0.12,
          weight:      1.5,
        }).addTo(map)
      : null;

    mapRef.current    = map;
    markerRef.current = marker;
    circleRef.current = circle;

    return () => {
      map.remove();
      mapRef.current    = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Atualiza posição quando prop muda (ex: "atualizar localização") ─────────
  useEffect(() => {
    const map    = mapRef.current;
    const marker = markerRef.current;
    const circle = circleRef.current;
    if (!map || !marker) return;

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 17, { animate: true });

    if (circle) {
      circle.setLatLng([lat, lng]);
      if (accuracy) circle.setRadius(accuracy);
    }
  }, [lat, lng, accuracy]);

  return (
    <div
      ref={containerRef}
      className={`w-full rounded-xl overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
