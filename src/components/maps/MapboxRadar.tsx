"use client";

import * as mapboxgl from "mapbox-gl/esm";
import { useCallback, useEffect, useRef } from "react";
import type { ServiceRequest } from "@/lib/marketplace";

type MapboxRadarProps = {
  requests: ServiceRequest[];
};

type SectorCoordinate = {
  latitude: number;
  longitude: number;
};

const MEDELLIN_CENTER: SectorCoordinate = {
  latitude: 6.235,
  longitude: -75.575,
};

const SECTOR_COORDINATES: Record<string, SectorCoordinate> = {
  Belén: { latitude: 6.229, longitude: -75.603 },
  Envigado: { latitude: 6.169, longitude: -75.591 },
  Laureles: { latitude: 6.244, longitude: -75.591 },
  "El Poblado": { latitude: 6.208, longitude: -75.568 },
  Centro: { latitude: 6.251, longitude: -75.568 },
};

function createRadiusPolygon(center: SectorCoordinate, radiusInKilometers: number) {
  const points = Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * Math.PI * 2;
    const latitudeDelta = (radiusInKilometers / 111.32) * Math.sin(angle);
    const longitudeDelta =
      (radiusInKilometers / (111.32 * Math.cos((center.latitude * Math.PI) / 180))) *
      Math.cos(angle);

    return [center.longitude + longitudeDelta, center.latitude + latitudeDelta];
  });

  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Polygon" as const,
      coordinates: [points],
    },
  };
}

function coordinateForRequest(request: ServiceRequest, index: number) {
  const sector = SECTOR_COORDINATES[request.sector] ?? MEDELLIN_CENTER;
  const offset = ((index % 3) - 1) * 0.0025;

  return {
    longitude: sector.longitude + offset,
    latitude: sector.latitude + offset * 0.45,
  };
}

export function MapboxRadar({ requests }: MapboxRadarProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const requestsRef = useRef(requests);
  const mapReadyRef = useRef(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const requestKey = requests.map((request) => `${request.id}:${request.sector}`).join("|");

  const syncMarkers = useCallback((map: mapboxgl.Map) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = requestsRef.current.map((request, index) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = "mapbox-request-marker";
      markerElement.setAttribute("aria-label", `Solicitud de ${request.category} en ${request.sector}`);

      const popupContent = document.createElement("div");
      popupContent.className = "mapbox-request-popup";
      const title = document.createElement("strong");
      title.textContent = request.category;
      const details = document.createElement("span");
      details.textContent = `${request.sector} · ${request.distance}`;
      popupContent.append(title, details);

      return new mapboxgl.Marker({ element: markerElement, anchor: "center" })
        .setLngLat([coordinateForRequest(request, index).longitude, coordinateForRequest(request, index).latitude])
        .setPopup(new mapboxgl.Popup({ closeButton: false, offset: 12 }).setDOMContent(popupContent))
        .addTo(map);
    });
  }, []);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      accessToken: token,
      center: [MEDELLIN_CENTER.longitude, MEDELLIN_CENTER.latitude],
      container: mapContainerRef.current,
      cooperativeGestures: true,
      dragRotate: false,
      minZoom: 10,
      style: "mapbox://styles/mapbox/light-v11",
      zoom: 11.35,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        showUserHeading: false,
        trackUserLocation: false,
      }),
      "top-right",
    );

    map.once("load", () => {
      map.addSource("service-radius", {
        data: createRadiusPolygon(MEDELLIN_CENTER, 5),
        type: "geojson",
      });
      map.addLayer({
        id: "service-radius-fill",
        paint: { "fill-color": "#4d69d8", "fill-opacity": 0.09 },
        source: "service-radius",
        type: "fill",
      });
      map.addLayer({
        id: "service-radius-line",
        paint: { "line-color": "#4d69d8", "line-opacity": 0.48, "line-width": 1.5 },
        source: "service-radius",
        type: "line",
      });
      mapReadyRef.current = true;
      syncMarkers(map);
    });

    return () => {
      mapReadyRef.current = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [syncMarkers, token]);

  useEffect(() => {
    if (mapReadyRef.current && mapRef.current) syncMarkers(mapRef.current);
  }, [requestKey, syncMarkers]);

  if (!token) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-[#c9d4ef] bg-[#f5f7ff] p-6 text-center">
        <div>
          <p className="text-sm font-semibold text-[#19242d]">Mapa pendiente de configuración</p>
          <p className="mt-2 max-w-sm text-xs leading-5 text-[#71808f]">
            Agrega NEXT_PUBLIC_MAPBOX_TOKEN en las variables de entorno para activar el radar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#dce3ef] bg-[#e8edf6] shadow-[0_10px_28px_rgba(40,52,68,0.06)]" aria-label="Radar de solicitudes cercanas">
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4d69d8] shadow-sm backdrop-blur-sm">
          Radar activo · 5 km
        </div>
        <div className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#647382] shadow-sm backdrop-blur-sm">
          Ubicación aproximada
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#19242d]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4d69d8] ring-4 ring-[#4d69d8]/15" />
          {requests.length} solicitudes disponibles
        </div>
        <p className="mt-1 text-[10px] text-[#778592]">La dirección exacta se revela al asignar.</p>
      </div>
    </section>
  );
}
