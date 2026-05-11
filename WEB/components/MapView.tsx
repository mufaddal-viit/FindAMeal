"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Place } from "@/types/place";

interface MapViewProps {
  places: Place[];
  selectedPlaceId?: string;
  onSelectPlace?: (id: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

const DEFAULT_LAT = 25.2048;
const DEFAULT_LNG = 55.2708;
const DEFAULT_ZOOM = 12;

export default function MapView({
  places,
  selectedPlaceId,
  onSelectPlace,
  centerLat = DEFAULT_LAT,
  centerLng = DEFAULT_LNG,
  zoom = DEFAULT_ZOOM
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([centerLat, centerLng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, [centerLat, centerLng, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    places.forEach((place) => {
      if (!place.coordinates) return;

      const isSelected = place.id === selectedPlaceId;

      const marker = L.marker([place.coordinates.latitude, place.coordinates.longitude], {
        icon: L.divIcon({
          className: `custom-marker ${isSelected ? "selected" : ""}`,
          html: `
            <div class="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-lg transition-all ${
              isSelected ? "bg-accent scale-125" : "bg-leaf hover:bg-accent"
            }">
              📍
            </div>
          `,
          iconSize: [40, 40],
          popupAnchor: [0, -20]
        })
      })
        .addTo(mapRef.current!)
        .bindPopup(`<div class="p-2"><strong>${place.name}</strong><br/>${place.rating}/5 ⭐</div>`)
        .on("click", () => {
          onSelectPlace?.(place.id);
        });

      markersRef.current.set(place.id, marker);
    });
  }, [places, selectedPlaceId, onSelectPlace]);

  return (
    <div className="relative h-96 w-full rounded-[1.5rem] border border-leaf/10 overflow-hidden shadow-lg shadow-leaf/10 dark:border-slate-600 dark:shadow-slate-900/30">
      <div id="map" className="h-full w-full" />
      <style jsx>{`
        :global(#map .leaflet-popup-content-wrapper) {
          border-radius: 0.75rem;
          border: 1px solid rgba(31, 93, 82, 0.1);
        }
      `}</style>
    </div>
  );
}
