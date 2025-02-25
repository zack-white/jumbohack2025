"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

const accessToken: string = 'pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og';

mapboxgl.accessToken = accessToken;

interface FullScreenMapProps {
  long: number;
  lat: number;
  scale: number;
  onLocationSelect: (coordinates: { x: number; y: number }, zoom: number) => void;
}

export default function FullScreenMap({ long, lat, scale, onLocationSelect }: FullScreenMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [long, lat], // Use provided long, lat
      zoom: scale, // Use provided scale
    });

    mapRef.current = map;

    // Add Search Bar
    const geocoder = new MapboxGeocoder({
      accessToken, 
      marker: false,
      placeholder: "Search for places",
    });

    map.addControl(geocoder, "top-right");

    // Add marker at the initial position
    markerRef.current = new mapboxgl.Marker()
      .setLngLat([long, lat])
      .addTo(map);

    // Click event to update marker
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
    };

    map.on("click", handleMapClick);

    // Cleanup function
    return () => {
      map.off("click", handleMapClick);
      map.remove();
    };
  }, [long, lat, scale]); // Ensure map updates when these props change

  const handleSaveLocation = () => {
    if (!mapRef.current || !markerRef.current) return;

    const coordinates = markerRef.current.getLngLat();
    const zoom = mapRef.current.getZoom();

    onLocationSelect({ x: coordinates.lng, y: coordinates.lat }, zoom);
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="absolute top-0 left-0" style={{width: "100%", height: "300px"}}/>
      <div className="absolute z-10 pt-5 right-0">
        <button
          onClick={handleSaveLocation}
          className="bg-[#2971AC] text-white px-6 py-2"
          style={{width: "160px"}}
        >
          Save Location
        </button>
      </div>
    </div>
  );
}
