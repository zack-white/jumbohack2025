"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import style from "./map.module.css";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

mapboxgl.accessToken = "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

interface MapboxMapProps {
  onLocationSelect: (coordinates: { x: number; y: number }, zoom: number) => void;
}

export default function MapboxMap({ onLocationSelect }: MapboxMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const INITIAL_LONG = -71.120;
  const INITIAL_LAT = 42.4075;
  const INITIAL_ZOOM = 17.33;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [INITIAL_LONG, INITIAL_LAT],
      zoom: INITIAL_ZOOM,
    });

    mapRef.current = map;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: "Search for places",
    });

    map.addControl(geocoder, "top-right");

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);
      
      markerRef.current = marker;
    });

    return () => {
      map?.remove();
    };
  }, []);

  const handleSaveLocation = () => {
    if (!mapRef.current || !markerRef.current) return;
    
    const coordinates = markerRef.current.getLngLat();
    const zoom = mapRef.current.getZoom();
    
    onLocationSelect(
      { x: coordinates.lat, y: coordinates.lng },
      zoom
    );
  };

  return (
    <div className="wrapper">
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "300px" }}
      />
      <div className="bottom-4 right-4">
        <button
            onClick={handleSaveLocation}
            className="h-11 px-6 bg-[#2E73B5] text-white mt-6 font-inter">
            Save Location
        </button>
      </div>
    </div>
  );
}