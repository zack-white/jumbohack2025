"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import InfoPopup from "@/components/ClubInfo"
import "./mapview.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { unique } from "next/dist/build/utils";

interface Club {
    id: number;
    name: string;
    category: string,
    description: string
  }

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;

const EVENT_ID = 1;  // CHANGE THIS TO BE IMPORTED FROM CALLING PAGE

export default function MapboxMap() {
  // Map container and map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Initial position of map (Tufts Academic Quad rn)
  const [long, setLong] = useState(INITIAL_LONG);
  const [lat, setLat] = useState(INITIAL_LAT);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  // Keep track of clubs to add to map
  const [clubs, setClubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [queue, setQueue] = useState<any[]>([]);

  // Track club to show popup for
  const [clubInfo, setClubInfo] = useState<any>();
  const [showClubInfo, setShowClubInfo] = useState(false);

  // On page render, create map and fetch all old clubs w/ for given event.
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [long, lat],
      zoom: zoom,
    });
    mapRef.current = map;

    // Function to fetch all existing clubs to add to map
    const getExistingClubs = async () => {
        try {
            const response = await fetch("/api/getExistingClubs", {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                console.log("Error fetching existing clubs.");
            }

            return await response.json();;
        } catch(error) {
            console.error("Error" + error);
        }
    }

    // EXECUTED ON LOAD

    // Fetch a club by clicking on their table (specified by coords)
    const getClubByCoords = async (lng: number, lat: number) => {
        try {
            const response = await fetch("/api/getClubByCoords", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    x: lng,
                    y: lat
                })
            });

            if (!response.ok) {
                console.log("Error fetching existing clubs.");
            }

            return await response.json();;
        } catch(error) {
            console.error("Error" + error);
        }
    }

    // On load, import all existing club pins and add to map
    map.on('load', async () => {
        const existingClubs = await getExistingClubs();
        existingClubs.map((club: any) => {
            const marker = new mapboxgl.Marker()
                .setLngLat([club.coordinates.x, club.coordinates.y])
                .addTo(map);
    
            // Add a click event listener to the marker
            marker.getElement().addEventListener("click", async (event) => {
                event.stopPropagation();  // Prevents map click from triggering
                
                // Get club by long and lat coords
                const { lng, lat } = marker.getLngLat();
                const club = await getClubByCoords(lng, lat)
                console.log(club);
                setClubInfo({ id: club.id, name: club.name, description: club.description });
                setShowClubInfo(true);
            });
        });
    });

    async function fetchClubs() {
      const response = await fetch('/api/getExistingClubs');
      const data = await response.json();
      setClubs(data);
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((club: Club) => club.category))];
      setCategories(uniqueCategories);
    };
  
    // Fetch clubs on page load
    fetchClubs();

    mapRef.current.on("move", () => {
      // Get the current center coordinates and zoom level from the map
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();

      setLong(mapCenter.lng);
      setLat(mapCenter.lat);
      setZoom(mapZoom);
    });

    // Cleanup on unmount
    return () => map.remove();
  }, []);

  // Update queue when category is selected
  useEffect(() => {
    if (selectedCategory) {
      // Filter clubs by category AND ensure they don't have coordinates
      const filteredClubs = clubs.filter(
        (club) => 
          club.category === selectedCategory && 
          (club.x === undefined || club.x === null) && 
          (club.y === undefined || club.y === null)
      );
      setQueue(filteredClubs);
    }
  }, [selectedCategory, clubs]);

  return (
    <div className="wrapper">
      <div ref={mapContainerRef} className="mapContainer"/>
      {showClubInfo && <InfoPopup club={clubInfo} onClose={() => setShowClubInfo(false)} />}
      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Student Org. Club Fair</h1>

        {/* Category Dropdown */}
        <div className="mb-4 w-3/5 bg-categoryBg">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-4 border rounded bg-categoryBg"
          >
            <option>Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {/* Queue */}
        <div className="mb-4">
          <ul className="flex flex-row overflow-auto">
            {queue.map((club) => (
              <li key={club.id} className="p-4 mr-2 border-b bg-categoryBg min-w-[8vw] truncate text-center">
                {club.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
