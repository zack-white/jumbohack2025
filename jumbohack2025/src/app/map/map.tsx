// "use client" is required at the top for client-side rendering
"use client";

import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import style from "./map.module.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

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
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-71.120, 42.4075], // [lng, lat]
      zoom: 17.33,
    });

    // Initialize the geocoder (search bar)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: {
        color: "orange", // Customize marker color if desired
      },
      placeholder: "Search for places",
    });

    // Add the geocoder to the map
    map.addControl(geocoder, "top-right");

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} className={style.mapContainer}/>;
};

export default MapboxMap;
