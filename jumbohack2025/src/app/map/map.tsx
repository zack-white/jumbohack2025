// "use client" is required at the top for client-side rendering
"use client";


import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import style from "./map.module.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import CreateEventModal from "../components/createEventPop";

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const MapboxMap: React.FC = () => {
  // Create a ref to hold the map container
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // State to control modal visibility and its props
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState<{ center: mapboxgl.LngLat; zoom: number } | null>(null);


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

    mapRef.current = map;

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

  // Handler for saving the current map view
  const handleSaveLocation = () => {
    if (!mapRef.current) return;
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    
    // You can also send these values to your backend or save them to local storage.
    console.log("Saved location:", {
      lng: center.lng,
      lat: center.lat,
      zoom,
    });
    // call create event popup and send center and zoom to it
    setModalProps({ center, zoom });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalProps(null);
  };

  const handleModalSubmit = (eventId: string) => {
    console.log("Event created with ID:", eventId);
    setShowModal(false);
    setModalProps(null);
  };

  return (
    <div className="wrapper">
      <div ref={mapContainerRef} className={style.mapContainer}/>
      <div className="button">
        <button
          onClick={handleSaveLocation}
          className={style.saveLocationButton}
        >
          Save Location
        </button>
        {/* Conditionally render the CreateEventModal */}
        {showModal && modalProps && (
        <CreateEventModal
          center={modalProps.center}
          zoom={modalProps.zoom}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
      </div>
    </div>
  );
};

export default MapboxMap;
