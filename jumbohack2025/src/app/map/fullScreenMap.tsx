"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import style from "./map.module.css";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

interface FullScreenMapProps {
  long: number;
  lat: number;
  scale: number;
}

export default function FullScreenMap({ long, lat, scale }: FullScreenMapProps) {
  // Reference to store the Mapbox instance and container
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log('Initializing FullScreenMap with:');
    console.log('long:', long);
    console.log('lat:', lat);
    console.log('scale:', scale);

    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lat, long],
      zoom: scale,
    });

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
    };
  }, []); // Add [long, lat, scale] here if the map should update when these props change

  return (
    <div className="wrapper">
      <div ref={mapContainerRef} className={style.fullMapContainer} />
    </div>
  );
}
