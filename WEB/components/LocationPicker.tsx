"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents
} from "react-leaflet";
import L from "leaflet";
import type { LeafletMouseEvent, Marker as LeafletMarker } from "leaflet";

const DEBOUNCE_MS = 420;
const NOMINATIM_MIN_MS = 1100;
const CACHE_PRECISION = 3;
const DEFAULT_ZOOM = 13;
const GPS_MAX_AGE = 30000;
const GPS_TIMEOUT = 8000;
const SEARCH_MAX_LENGTH = 200;
const SEARCH_LIMIT = 5;
const DEFAULT_CENTER = {
  lat: 25.2048,
  lng: 55.2708
} as const;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationPickerResult {
  lat: number;
  lng: number;
  address: string;
}

interface NominatimSearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface NominatimReverseResult {
  display_name?: string;
}

interface AutocompleteOption {
  id: string;
  address: string;
  coordinates: Coordinates;
}

type AddressStatus = "idle" | "resolving" | "ready" | "error";

interface LocationPickerProps {
  onLocationConfirm?: (result: LocationPickerResult) => void;
}

const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="position: relative; width: 24px; height: 36px;">
      <div style="position: absolute; left: 50%; top: 0; width: 24px; height: 24px; background: #1f5d52; border: 3px solid rgba(255,255,255,0.78); border-radius: 9999px; transform: translateX(-50%); box-shadow: 0 8px 18px rgba(19,44,42,0.28);"></div>
      <div style="position: absolute; left: 50%; top: 18px; width: 4px; height: 18px; background: #132c2a; border-radius: 9999px; transform: translateX(-50%);"></div>
    </div>
  `,
  iconSize: [24, 36],
  iconAnchor: [12, 36]
});

function sanitizeAutocompleteInput(value: string) {
  return value.replace(/[<>"'`]/g, "").slice(0, SEARCH_MAX_LENGTH);
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(CACHE_PRECISION));
}

function getCacheKey(coordinates: Coordinates) {
  return `${roundCoordinate(coordinates.lat)}:${roundCoordinate(coordinates.lng)}`;
}

function toEncodedCoordinate(value: number) {
  return encodeURIComponent(value.toString());
}

function isValidCoordinates(coordinates: Coordinates) {
  return (
    Number.isFinite(coordinates.lat) &&
    Number.isFinite(coordinates.lng) &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
}

function getGpsErrorMessage(code: number) {
  switch (code) {
    case 1:
      return "Location permission was denied. Search or drag the pin manually.";
    case 2:
      return "Your location is unavailable right now. Search or drag the pin manually.";
    case 3:
      return "Location request timed out. Search or drag the pin manually.";
    default:
      return "Could not detect your location. Search or drag the pin manually.";
  }
}

function getAddressBarContent(status: AddressStatus, address: string, error: string | null) {
  switch (status) {
    case "resolving":
      return "Resolving address...";
    case "ready":
      return address;
    case "error":
      return error ?? "Something went wrong while resolving the address.";
    case "idle":
    default:
      return "Search for a place, detect your location, click the map, or drag the pin.";
  }
}

function MapViewportController({
  coordinates
}: {
  coordinates: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([coordinates.lat, coordinates.lng], DEFAULT_ZOOM, {
      animate: true,
      duration: 1.2
    });
  }, [coordinates, map]);

  return null;
}

function MapClickHandler({
  onMapSelect
}: {
  onMapSelect: (coordinates: Coordinates) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onMapSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng
      });
    }
  });

  return null;
}

function MapResizeController() {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [map]);

  return null;
}

export default function LocationPicker({
  onLocationConfirm
}: LocationPickerProps) {
  const markerRef = useRef<LeafletMarker | null>(null);
  const cacheRef = useRef(new Map<string, string>());
  const activeRequestControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNominatimRequestAtRef = useRef(0);
  const [searchValue, setSearchValue] = useState("");
  const [autocompleteOptions, setAutocompleteOptions] = useState<
    AutocompleteOption[]
  >([]);
  const [highlightedOptionIndex, setHighlightedOptionIndex] = useState(-1);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("idle");
  const [addressError, setAddressError] = useState<string | null>(null);

  const mapCenter = selectedCoordinates ?? DEFAULT_CENTER;
  const canConfirm =
    selectedCoordinates !== null &&
    addressStatus === "ready" &&
    resolvedAddress.trim().length > 0;
  const addressBarContent = getAddressBarContent(
    addressStatus,
    resolvedAddress,
    addressError
  );

  const cancelActiveRequest = useCallback(() => {
    if (activeRequestControllerRef.current) {
      activeRequestControllerRef.current.abort();
      activeRequestControllerRef.current = null;
    }
  }, []);

  const waitForNominatimWindow = useCallback(async () => {
    const elapsed = Date.now() - lastNominatimRequestAtRef.current;

    if (elapsed < NOMINATIM_MIN_MS) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, NOMINATIM_MIN_MS - elapsed)
      );
    }

    lastNominatimRequestAtRef.current = Date.now();
  }, []);

  const reverseGeocode = useCallback(
    async (coordinates: Coordinates) => {
      if (!isValidCoordinates(coordinates)) {
        setAddressStatus("error");
        setAddressError("The selected coordinates are invalid.");
        return null;
      }

      const cacheKey = getCacheKey(coordinates);
      const cachedAddress = cacheRef.current.get(cacheKey);

      if (cachedAddress) {
        setResolvedAddress(cachedAddress);
        setAddressStatus("ready");
        setAddressError(null);
        return cachedAddress;
      }

      cancelActiveRequest();
      setAddressStatus("resolving");
      setAddressError(null);

      const controller = new AbortController();
      activeRequestControllerRef.current = controller;

      try {
        await waitForNominatimWindow();

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${toEncodedCoordinate(
            coordinates.lat
          )}&lon=${toEncodedCoordinate(coordinates.lng)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Reverse geocoding failed.");
        }

        const data = (await response.json()) as NominatimReverseResult;
        const nextAddress = data.display_name?.trim();

        if (!nextAddress) {
          throw new Error("No address was found for this point.");
        }

        cacheRef.current.set(cacheKey, nextAddress);
        setResolvedAddress(nextAddress);
        setAddressStatus("ready");
        setAddressError(null);

        return nextAddress;
      } catch (error) {
        if (controller.signal.aborted) {
          return null;
        }

        setResolvedAddress("");
        setAddressStatus("error");
        setAddressError(
          error instanceof Error
            ? error.message
            : "Something went wrong while resolving the address."
        );

        return null;
      } finally {
        if (activeRequestControllerRef.current === controller) {
          activeRequestControllerRef.current = null;
        }
      }
    },
    [cancelActiveRequest, waitForNominatimWindow]
  );

  const runAutocompleteSearch = useCallback(
    async (value: string) => {
      const sanitizedValue = sanitizeAutocompleteInput(value).trim();

      if (sanitizedValue.length < 2) {
        setAutocompleteOptions([]);
        setIsAutocompleteOpen(false);
        setHighlightedOptionIndex(-1);
        return;
      }

      cancelActiveRequest();

      const controller = new AbortController();
      activeRequestControllerRef.current = controller;

      try {
        await waitForNominatimWindow();

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${encodeURIComponent(
            SEARCH_LIMIT.toString()
          )}&q=${encodeURIComponent(sanitizedValue)}`,
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json"
            }
          }
        );

        if (!response.ok) {
          throw new Error("Search failed.");
        }

        const data = (await response.json()) as NominatimSearchResult[];
        const options = data
          .map<AutocompleteOption | null>((item) => {
            const lat = Number(item.lat);
            const lng = Number(item.lon);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return null;
            }

            return {
              id: `${item.place_id}`,
              address: item.display_name,
              coordinates: { lat, lng }
            };
          })
          .filter((item): item is AutocompleteOption => item !== null);

        setAutocompleteOptions(options);
        setIsAutocompleteOpen(options.length > 0);
        setHighlightedOptionIndex(options.length > 0 ? 0 : -1);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setAutocompleteOptions([]);
        setIsAutocompleteOpen(false);
        setHighlightedOptionIndex(-1);
        setAddressStatus("error");
        setAddressError(
          error instanceof Error
            ? error.message
            : "Something went wrong while searching for addresses."
        );
      } finally {
        if (activeRequestControllerRef.current === controller) {
          activeRequestControllerRef.current = null;
        }
      }
    },
    [cancelActiveRequest, waitForNominatimWindow]
  );

  const debouncedAutocomplete = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void runAutocompleteSearch(value);
      }, DEBOUNCE_MS);
    },
    [runAutocompleteSearch]
  );

  const selectCoordinates = useCallback(
    async (coordinates: Coordinates) => {
      setSelectedCoordinates(coordinates);
      setAutocompleteOptions([]);
      setIsAutocompleteOpen(false);
      setHighlightedOptionIndex(-1);
      await reverseGeocode(coordinates);
    },
    [reverseGeocode]
  );

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = sanitizeAutocompleteInput(event.target.value);

    setSearchValue(nextValue);
    setAddressError(null);
    debouncedAutocomplete(nextValue);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && (!isAutocompleteOpen || autocompleteOptions.length === 0)) {
      event.preventDefault();
    }

    if (!isAutocompleteOpen || autocompleteOptions.length === 0) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsAutocompleteOpen(false);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedOptionIndex((current) =>
        current < autocompleteOptions.length - 1 ? current + 1 : 0
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedOptionIndex((current) =>
        current > 0 ? current - 1 : autocompleteOptions.length - 1
      );
      return;
    }

    if (event.key === "Enter") {
      const option = autocompleteOptions[highlightedOptionIndex];

      if (!option) {
        return;
      }

      event.preventDefault();
      handleOptionSelect(option);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsAutocompleteOpen(false);
      setHighlightedOptionIndex(-1);
    }
  }

  function handleOptionSelect(option: AutocompleteOption) {
    setSearchValue(option.address);
    setSelectedCoordinates(option.coordinates);
    setResolvedAddress(option.address);
    setAddressStatus("ready");
    setAddressError(null);
    setAutocompleteOptions([]);
    setIsAutocompleteOpen(false);
    setHighlightedOptionIndex(-1);
    cacheRef.current.set(getCacheKey(option.coordinates), option.address);
  }

  function handleDetectMyLocation() {
    if (!navigator.geolocation) {
      setAddressStatus("error");
      setAddressError(
        "Geolocation is not supported in this browser. Search or drag the pin manually."
      );
      return;
    }

    setAddressStatus("resolving");
    setAddressError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void selectCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        setAddressStatus("error");
        setAddressError(getGpsErrorMessage(error.code));
      },
      {
        maximumAge: GPS_MAX_AGE,
        timeout: GPS_TIMEOUT
      }
    );
  }

  function handleConfirm() {
    if (!canConfirm || !selectedCoordinates) {
      return;
    }

    onLocationConfirm?.({
      lat: selectedCoordinates.lat,
      lng: selectedCoordinates.lng,
      address: resolvedAddress
    });
  }

  function handleMarkerDragEnd() {
    const marker = markerRef.current;

    if (!marker) {
      return;
    }

    const nextCoordinates = marker.getLatLng();

    void selectCoordinates({
      lat: nextCoordinates.lat,
      lng: nextCoordinates.lng
    });
  }

  useEffect(() => {
    return () => {
      cancelActiveRequest();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cancelActiveRequest]);

  const markerPosition = useMemo(
    () =>
      selectedCoordinates
        ? ([selectedCoordinates.lat, selectedCoordinates.lng] as [number, number])
        : null,
    [selectedCoordinates]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search for an address"
            aria-label="Search for a location"
            className="h-12 w-full rounded-[1.2rem] border border-leaf/10 bg-sand px-4 text-sm text-ink outline-none transition focus:border-leaf"
          />

          {isAutocompleteOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-[1.25rem] border border-leaf/10 bg-paper shadow-lg shadow-leaf/10">
              <ul role="listbox" aria-label="Location search suggestions">
                {autocompleteOptions.map((option, index) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-label={`Select ${option.address}`}
                      aria-selected={highlightedOptionIndex === index}
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full px-4 py-3 text-left text-sm transition ${
                        highlightedOptionIndex === index
                          ? "bg-sand text-ink"
                          : "bg-paper text-leaf hover:bg-sand hover:text-ink"
                      }`}
                    >
                      {option.address}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleDetectMyLocation}
          aria-label="Detect my location"
          className="h-12 rounded-[1.2rem] bg-leaf px-5 text-sm font-semibold text-paper transition hover:bg-ink"
        >
          Detect my location
        </button>
      </div>

      <div
        aria-live="polite"
        className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
          addressStatus === "error"
            ? "border-amber bg-sand text-amber"
            : addressStatus === "ready"
              ? "border-leaf/15 bg-sand text-ink"
              : "border-leaf/10 bg-paper text-leaf/80"
        }`}
      >
        {addressBarContent}
      </div>

      <div
        role="application"
        aria-label="Interactive map for choosing a location"
        className="overflow-hidden rounded-[1.8rem] border border-leaf/10"
      >
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-[420px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizeController />
          <MapViewportController coordinates={mapCenter} />
          <MapClickHandler onMapSelect={(coordinates) => void selectCoordinates(coordinates)} />
          {markerPosition ? (
            <Marker
              draggable
              position={markerPosition}
              icon={markerIcon}
              ref={markerRef}
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canConfirm}
          aria-label="Confirm selected location"
          className="h-12 rounded-[1.2rem] bg-amber px-5 text-sm font-semibold text-ink transition hover:bg-leaf hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          Confirm location
        </button>
      </div>
    </div>
  );
}
