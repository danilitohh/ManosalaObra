"use client";

import { useEffect, useRef } from "react";
import type * as Leaflet from "leaflet";
import type { GeoPoint, ServiceRequest } from "@/lib/marketplace";

type MapboxRadarProps = {
  requests: ServiceRequest[];
  onOpenRequest: (request: ServiceRequest) => void;
  center: GeoPoint;
  radiusKm: number;
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

function coordinateForRequest(request: ServiceRequest) {
  const sector = SECTOR_COORDINATES[request.sector] ?? MEDELLIN_CENTER;
  const seed = Array.from(request.id).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const offset = ((seed % 5) - 2) * 0.0012;

  return {
    latitude: sector.latitude + offset * 0.45,
    longitude: sector.longitude + offset,
  };
}

function createPopupContent(
  request: ServiceRequest,
  onOpenRequest: (request: ServiceRequest) => void,
) {
  const content = document.createElement("div");
  content.className = "mapbox-request-popup";

  const title = document.createElement("strong");
  title.textContent = request.category;

  const details = document.createElement("span");
  details.textContent = `${request.sector} · ${request.distance}`;

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.textContent = "Ver servicio";
  openButton.setAttribute("aria-label", `Ver servicio: ${request.category} en ${request.sector}`);
  openButton.addEventListener("click", (event) => {
    event.stopPropagation();
    onOpenRequest(request);
  });

  content.append(title, details, openButton);
  return content;
}

function syncRequestMarkers(
  leaflet: typeof import("leaflet"),
  layer: Leaflet.LayerGroup,
  requests: ServiceRequest[],
  onOpenRequest: (request: ServiceRequest) => void,
) {
  layer.clearLayers();

  const icon = leaflet.divIcon({
    className: "mapbox-request-icon",
    html: '<span class="leaflet-request-dot" aria-hidden="true"></span>',
    iconAnchor: [12, 12],
    iconSize: [24, 24],
  });

  requests.forEach((request) => {
    const coordinate = coordinateForRequest(request);

    leaflet
      .marker([coordinate.latitude, coordinate.longitude], {
        alt: `Solicitud de ${request.category} en ${request.sector}`,
        icon,
        title: `${request.category} · ${request.sector}`,
      })
      .bindPopup(createPopupContent(request, onOpenRequest))
      .addTo(layer);
  });
}

export function MapboxRadar({ requests, onOpenRequest, center, radiusKm }: MapboxRadarProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markersLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const requestsRef = useRef(requests);
  const centerRef = useRef(center);
  const radiusRef = useRef(radiusKm);
  const onOpenRequestRef = useRef(onOpenRequest);
  const radarCircleRef = useRef<Leaflet.Circle | null>(null);
  const technicianMarkerRef = useRef<Leaflet.Marker | null>(null);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const requestKey = requests.map((request) => `${request.id}:${request.sector}`).join("|");

  useEffect(() => {
    centerRef.current = center;
    radiusRef.current = radiusKm;
    onOpenRequestRef.current = onOpenRequest;
  }, [center, onOpenRequest, radiusKm]);

  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  useEffect(() => {
    if (!token || !mapContainerRef.current) return;

    let cancelled = false;
    let map: Leaflet.Map | null = null;

    void import("leaflet").then((leaflet) => {
      if (cancelled || !mapContainerRef.current) return;

      leafletRef.current = leaflet;
      map = leaflet.map(mapContainerRef.current, {
        center: [centerRef.current.latitude, centerRef.current.longitude],
        dragging: true,
        maxZoom: 18,
        minZoom: 10,
        scrollWheelZoom: true,
        zoom: 12,
        zoomControl: false,
      });

      leaflet
        .tileLayer(
          `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/512/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`,
          {
            attribution:
              '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            minZoom: 10,
            tileSize: 512,
            zoomOffset: -1,
          },
        )
        .addTo(map);

      leaflet.control.zoom({ position: "topright" }).addTo(map);

      const radarCircle = leaflet
        .circle([centerRef.current.latitude, centerRef.current.longitude], {
          color: "#4d69d8",
          fillColor: "#4d69d8",
          fillOpacity: 0.09,
          opacity: 0.48,
          radius: radiusRef.current * 1000,
          weight: 1.5,
        })
        .addTo(map);
      radarCircleRef.current = radarCircle;

      const technicianIcon = leaflet.divIcon({
        className: "mapbox-technician-icon",
        html: '<span class="leaflet-technician-dot" aria-hidden="true"></span>',
        iconAnchor: [12, 12],
        iconSize: [24, 24],
      });

      const technicianMarker = leaflet
        .marker([centerRef.current.latitude, centerRef.current.longitude], {
          alt: "Ubicación de búsqueda del técnico",
          icon: technicianIcon,
          title: "Tu ubicación de búsqueda",
          zIndexOffset: 1000,
        })
        .addTo(map);
      technicianMarkerRef.current = technicianMarker;

      const markersLayer = leaflet.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapRef.current = map;
      syncRequestMarkers(leaflet, markersLayer, requestsRef.current, onOpenRequestRef.current);

      requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      cancelled = true;
      markersLayerRef.current?.clearLayers();
      markersLayerRef.current = null;
      radarCircleRef.current = null;
      technicianMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      map = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    const position: [number, number] = [center.latitude, center.longitude];
    if (!map) return;

    map.setView(position, map.getZoom(), { animate: true });
    radarCircleRef.current?.setLatLng(position);
    radarCircleRef.current?.setRadius(radiusKm * 1000);
    technicianMarkerRef.current?.setLatLng(position);
  }, [center.latitude, center.longitude, radiusKm]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const layer = markersLayerRef.current;

    if (leaflet && layer) syncRequestMarkers(leaflet, layer, requests, onOpenRequestRef.current);
  }, [requestKey, requests]);

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
    <section
      className="relative min-h-[300px] overflow-hidden rounded-2xl border border-[#dce3ef] bg-[#e8edf6] shadow-[0_10px_28px_rgba(40,52,68,0.06)]"
      aria-label="Radar de solicitudes cercanas"
    >
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex items-start justify-between p-4">
        <div className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#4d69d8] shadow-sm backdrop-blur-sm">
          Radar · {radiusKm} km
        </div>
        <div className="rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#647382] shadow-sm backdrop-blur-sm">
          Ubicación del técnico
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-4 left-4 z-[500] rounded-xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#19242d]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4d69d8] ring-4 ring-[#4d69d8]/15" />
          {requests.length} solicitudes disponibles
        </div>
        <p className="mt-1 text-[10px] text-[#778592]">La dirección exacta se revela al asignar.</p>
      </div>
    </section>
  );
}
