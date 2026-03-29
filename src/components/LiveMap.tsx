import { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveMapProps {
  clientLat: number;
  clientLng: number;
  providerLat?: number;
  providerLng?: number;
  showRoute?: boolean;
  onEtaUpdate?: (minutes: number, km: number) => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_MAPS_API_KEY = "AIzaSyCMLByhTQlf1RBbqWzdJb-DCbJxwOC_HL4";
const LIBRARIES: ("geometry" | "places")[] = ["geometry", "places"];

// Estilo minimalista para o mapa (remove POIs genéricos, deixa limpo)
const MAP_STYLE = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#e0eaff" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#fafafa" }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: "cooperative",
  styles: MAP_STYLE,
};

// ─── Ícones personalizados ────────────────────────────────────────────────────

function getClientIcon(): google.maps.Icon {
  return {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#3b82f6" opacity="0.18"/>
          <circle cx="20" cy="20" r="10" fill="#3b82f6" stroke="#fff" stroke-width="3"/>
          <circle cx="20" cy="20" r="4" fill="#fff"/>
        </svg>
      `),
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20),
  };
}

function getProviderIcon(): google.maps.Icon {
  return {
    url:
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
          <defs>
            <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
            </filter>
          </defs>
          <path d="M22 50 C22 50 4 32 4 18 A18 18 0 0 1 40 18 C40 32 22 50 22 50Z" fill="#ef4444" filter="url(#s)" stroke="#fff" stroke-width="2"/>
          <text x="22" y="24" text-anchor="middle" font-size="16" fill="#fff" font-family="sans-serif">★</text>
        </svg>
      `),
    scaledSize: new google.maps.Size(44, 52),
    anchor: new google.maps.Point(22, 48),
  };
}

// ─── Hook: interpolação suave do marcador do prestador ───────────────────────

function useSmoothMarker(lat?: number, lng?: number) {
  const [position, setPosition] = useState<google.maps.LatLngLiteral | null>(
    lat !== undefined && lng !== undefined ? { lat, lng } : null
  );
  const prevRef = useRef<google.maps.LatLngLiteral | null>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    const target = { lat, lng };

    if (!prevRef.current) {
      prevRef.current = target;
      setPosition(target);
      return;
    }

    const start = { ...prevRef.current };
    const startTime = performance.now();
    const DURATION = 1200; // ms — animação suave de 1.2s

    const animate = (now: number) => {
      const t = Math.min((now - startTime) / DURATION, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      setPosition({
        lat: start.lat + (target.lat - start.lat) * ease,
        lng: start.lng + (target.lng - start.lng) * ease,
      });
      if (t < 1) frameRef.current = requestAnimationFrame(animate);
      else prevRef.current = target;
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [lat, lng]);

  return position;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function LiveMap({
  clientLat,
  clientLng,
  providerLat,
  providerLng,
  showRoute = true,
  onEtaUpdate,
  className = "",
}: LiveMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const providerPosition = useSmoothMarker(providerLat, providerLng);

  const clientPosition = { lat: clientLat, lng: clientLng };

  // ── Calcula rota + ETA quando o prestador se mover ──
  const calcRoute = useCallback(() => {
    if (!providerPosition || !showRoute) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: providerPosition,
        destination: clientPosition,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS,
        },
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg && onEtaUpdate) {
            const minutes = Math.round((leg.duration_in_traffic?.value ?? leg.duration?.value ?? 0) / 60);
            const km = Math.round((leg.distance?.value ?? 0) / 100) / 10;
            onEtaUpdate(minutes, km);
          }
        }
      }
    );
  }, [providerPosition, clientLat, clientLng, showRoute, onEtaUpdate]);

  useEffect(() => { calcRoute(); }, [calcRoute]);

  // ── fitBounds: enquadra cliente + prestador ──
  const fitBounds = useCallback(() => {
    if (!mapRef.current || !providerPosition) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(clientPosition);
    bounds.extend(providerPosition);
    mapRef.current.fitBounds(bounds, { top: 80, bottom: 80, left: 40, right: 40 });
  }, [providerPosition, clientLat, clientLng]);

  useEffect(() => { fitBounds(); }, [fitBounds]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    fitBounds();
  }, [fitBounds]);

  // ── Estados de carregamento / erro ──
  if (loadError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className}`}>
        <p className="text-destructive font-medium">Erro ao carregar o mapa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-muted ${className}`}>
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        <p className="ml-3 text-muted-foreground">Carregando mapa…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      mapContainerClassName={className}
      center={clientPosition}
      zoom={15}
      onLoad={onMapLoad}
      options={MAP_OPTIONS}
    >
      {/* Marcador do cliente (fixo, azul) */}
      <Marker position={clientPosition} icon={getClientIcon()} title="Você está aqui" />

      {/* Marcador do prestador (animado, vermelho) */}
      {providerPosition && (
        <Marker position={providerPosition} icon={getProviderIcon()} title="Prestador" />
      )}

      {/* Rota desenhada */}
      {directions && showRoute && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 5, strokeOpacity: 0.85 },
          }}
        />
      )}
    </GoogleMap>
  );
}

export default LiveMap;
