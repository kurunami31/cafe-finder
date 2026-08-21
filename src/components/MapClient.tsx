"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function CafeIcon() {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#faf7f1" stroke-width="1.5"><path d="M12 21c4-4.5 7-8 7-11a7 7 0 1 0-14 0c0 3 3 6.5 7 11Z" fill="#1ba7ae" stroke="#12858c"/><path d="M15.5 9.5h1a1.75 1.75 0 0 1 0 3.5h-1" stroke="#fff"/><path d="M5.5 9.5h10v3.25a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3Z" stroke="#fff"/></svg>`,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -30],
  });
}

export default function MapClient({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={CafeIcon()}>
        <Popup>{name}</Popup>
      </Marker>
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);
  return null;
}
