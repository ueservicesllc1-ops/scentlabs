"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { CustomerAddress } from "@/types/customer";

interface GoogleAddressAutocompleteProps {
  initialAddress?: Partial<CustomerAddress>;
  onAddressSelect: (address: Partial<CustomerAddress>) => void;
  disabled?: boolean;
}

export function GoogleAddressAutocomplete({
  initialAddress,
  onAddressSelect,
  disabled = false,
}: GoogleAddressAutocompleteProps) {
  const [query, setQuery] = useState(initialAddress?.line1 || initialAddress?.streetAddress || "");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [sessionToken, setSessionToken] = useState<any>(null);
  const [selected, setSelected] = useState(false);

  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const dummyElementRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return;

    // Check if Google script already present
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      initGoogleServices();
      return;
    }

    const scriptId = "google-maps-places-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleServices();
      script.onerror = () => setIsGoogleLoaded(false);
      document.head.appendChild(script);
    }
  }, [apiKey]);

  const initGoogleServices = () => {
    if (typeof window !== "undefined" && (window as any).google?.maps?.places) {
      const google = (window as any).google;
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      if (dummyElementRef.current) {
        placesServiceRef.current = new google.maps.places.PlacesService(dummyElementRef.current);
      }
      setSessionToken(new google.maps.places.AutocompleteSessionToken());
      setIsGoogleLoaded(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(false);

    // Call upstream onAddressSelect for manual typing
    onAddressSelect({
      line1: val,
      streetAddress: val,
    });

    if (!isGoogleLoaded || !autocompleteServiceRef.current || val.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: val,
        sessionToken,
        types: ["address"],
        componentRestrictions: { country: ["us", "ca"] },
      },
      (results: any[], status: any) => {
        setLoading(false);
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
        } else {
          setPredictions([]);
        }
      }
    );
  };

  const handleSelectPrediction = (placeId: string, description: string) => {
    setQuery(description);
    setPredictions([]);
    setSelected(true);

    if (!placesServiceRef.current) {
      onAddressSelect({ line1: description, streetAddress: description });
      return;
    }

    // Retrieve place details with structured components
    placesServiceRef.current.getDetails(
      {
        placeId,
        sessionToken,
        fields: ["address_components", "formatted_address"],
      },
      (place: any, status: any) => {
        // Reset session token after selection as per Google best practice
        if ((window as any).google?.maps?.places) {
          setSessionToken(new (window as any).google.maps.places.AutocompleteSessionToken());
        }

        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          let streetNumber = "";
          let route = "";
          let suite = "";
          let city = "";
          let state = "";
          let postalCode = "";
          let country = "US";

          for (const comp of place.address_components) {
            const types: string[] = comp.types;
            if (types.includes("street_number")) streetNumber = comp.long_name;
            if (types.includes("route")) route = comp.long_name;
            if (types.includes("subpremise")) suite = comp.long_name;
            if (types.includes("locality")) city = comp.long_name;
            if (!city && types.includes("sublocality")) city = comp.long_name;
            if (!city && types.includes("postal_town")) city = comp.long_name;
            if (types.includes("administrative_area_level_1")) state = comp.short_name;
            if (types.includes("postal_code")) postalCode = comp.long_name;
            if (types.includes("country")) country = comp.short_name;
          }

          const line1 = `${streetNumber} ${route}`.trim() || description;

          onAddressSelect({
            line1,
            streetAddress: line1,
            line2: suite ? `Apt / Suite ${suite}` : "",
            city,
            state,
            postalCode,
            country,
          });
        }
      }
    );
  };

  return (
    <div className="relative font-mono text-xs">
      <div ref={dummyElementRef} className="hidden" />

      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={query}
          onChange={handleInputChange}
          placeholder="Start typing your street address (e.g. 123 Main St)..."
          className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500 transition"
        />

        <div className="absolute left-3 top-3 text-lab-500">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        {selected && (
          <div className="absolute right-3 top-3 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {predictions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-12 rounded-xl bg-lab-950 border border-lab-800 shadow-2xl overflow-hidden divide-y divide-lab-900">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelectPrediction(p.place_id, p.description)}
              className="w-full text-left p-3 hover:bg-lab-900 text-lab-300 hover:text-white transition flex items-center gap-2.5 text-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{p.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
