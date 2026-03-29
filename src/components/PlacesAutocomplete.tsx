import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder,
  className,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  // Poll for google.maps.places availability
  useEffect(() => {
    if (window.google?.maps?.places) {
      setReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        setReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Initialize Autocomplete
  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "br" },
      fields: ["geometry", "formatted_address"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (place.formatted_address && place.geometry?.location) {
        onPlaceSelected(
          place.formatted_address,
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
      }
    });

    autocompleteRef.current = ac;
  }, [ready, onPlaceSelected]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
