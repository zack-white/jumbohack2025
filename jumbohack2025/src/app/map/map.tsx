// "use client" is required at the top for client-side rendering
"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const MapboxMap: React.FC = () => {
  // Create a ref to hold the map container
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Ensure the container is available
    if (!mapContainerRef.current) return;

    // Initialize the map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-71.120, 42.4075], // [lng, lat]
      zoom: 17.33,
    });

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />;
};

export default MapboxMap;
