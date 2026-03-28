"use client";

import { useState } from "react";
import type { SearchCoordinates } from "@/lib/locationQuery";

function roundCoordinate(value: number) {
  return Number(value.toFixed(6));
}

function normalizeCoordinates(
  coordinates: SearchCoordinates | null
): SearchCoordinates | null {
  if (!coordinates) {
    return null;
  }

  const { latitude, longitude } = coordinates;

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude: roundCoordinate(latitude),
    longitude: roundCoordinate(longitude)
  };
}

function getLocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. You can still enter a city manually.";
    case error.POSITION_UNAVAILABLE:
      return "Your current location is unavailable right now.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "Could not get your current location.";
  }
}

export function useCurrentLocation(
  initialCoordinates: SearchCoordinates | null = null
) {
  const [coordinates, setCoordinates] = useState<SearchCoordinates | null>(
    normalizeCoordinates(initialCoordinates)
  );
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCurrentLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      setCoordinates(null);
      return null;
    }

    setIsLocating(true);
    setError(null);

    return new Promise<SearchCoordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextCoordinates = normalizeCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          setIsLocating(false);

          if (!nextCoordinates) {
            setCoordinates(null);
            setError("Could not read your current location.");
            resolve(null);
            return;
          }

          setCoordinates(nextCoordinates);
          setError(null);
          resolve(nextCoordinates);
        },
        (positionError) => {
          setIsLocating(false);
          setCoordinates(null);
          setError(getLocationErrorMessage(positionError));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  function clearCurrentLocation() {
    setCoordinates(null);
    setError(null);
  }

  return {
    coordinates,
    isLocating,
    error,
    hasCurrentLocation: coordinates !== null,
    requestCurrentLocation,
    clearCurrentLocation
  };
}
