import { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAS6DIG32UlzRqldOlMlIhooo7wSLwvPNQ';
const LIBRARIES: ('places')[] = ['places'];
const ROUTE_DEBOUNCE_MS = 5000;

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

interface LiveMapProps {
  clientLat: number;
  clientLng: number;
  providerLat?: number | null;
  providerLng?: number | null;
  showRoute?: boolean;
  onEtaUpdate?: (minutes: number, distanceKm: number) => void;
}

export default function LiveMap({
  clientLat,
  clientLng,
  providerLat,
  providerLng,
  showRoute = false,
  onEtaUpdate,
}: LiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const lastRouteCalc = useRef(0);
  const routeTimeout = useRef<ReturnType<typeof setTimeout>>();

  const hasProvider = providerLat != null && providerLng != null;

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds when both markers exist
  useEffect(() => {
    if (!mapRef.current || !hasProvider) return;
    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: clientLat, lng: clientLng });
    bounds.extend({ lat: providerLat!, lng: providerLng! });
    mapRef.current.fitBounds(bounds, 60);
  }, [clientLat, clientLng, providerLat, providerLng, hasProvider]);

  // Calculate route with debounce
  useEffect(() => {
    if (!isLoaded || !hasProvider || !showRoute) {
      setDirections(null);
      return;
    }

    const calcRoute = () => {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: providerLat!, lng: providerLng! },
          destination: { lat: clientLat, lng: clientLng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0]?.legs[0];
            if (leg && onEtaUpdate) {
              const mins = Math.ceil((leg.duration?.value ?? 0) / 60);
              const km = (leg.distance?.value ?? 0) / 1000;
              onEtaUpdate(mins, km);
            }
          }
        }
      );
      lastRouteCalc.current = Date.now();
    };

    const elapsed = Date.now() - lastRouteCalc.current;
    if (elapsed >= ROUTE_DEBOUNCE_MS) {
      calcRoute();
    } else {
      clearTimeout(routeTimeout.current);
      routeTimeout.current = setTimeout(calcRoute, ROUTE_DEBOUNCE_MS - elapsed);
    }

    return () => clearTimeout(routeTimeout.current);
  }, [isLoaded, hasProvider, showRoute, providerLat, providerLng, clientLat, clientLng, onEtaUpdate]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: clientLat, lng: clientLng }}
      zoom={15}
      onLoad={onLoad}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      {/* Client marker */}
      <Marker
        position={{ lat: clientLat, lng: clientLng }}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        }}
        title="Você está aqui"
      />

      {/* Provider marker */}
      {hasProvider && (
        <Marker
          position={{ lat: providerLat!, lng: providerLng! }}
          icon={{
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
            rotation: 0,
          }}
          title="Prestador"
        />
      )}

      {/* Route */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#3b82f6',
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}
    </GoogleMap>
  );
}
