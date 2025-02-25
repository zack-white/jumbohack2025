"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import InfoPopup from "@/components/ClubInfo";
import "./placement.css";
import "mapbox-gl/dist/mapbox-gl.css";

interface Club {
  id: number;
  name: string;
  description: string;
  category: string;
  coordinates?: {
    x: number;
    y: number;
  };
  x?: number;
  y?: number;
}

interface ClubInfo {
  id: number;
  name: string;
  description: string;
}

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;

export default function PlacementPage() {
  const { eventID } = useParams();
  const id = Number(eventID); // Ensure ID is a number

  // Map container and map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Initial map state
  const [long, setLong] = useState(INITIAL_LONG);
  const [lat, setLat] = useState(INITIAL_LAT);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  // Keep track of clubs to add to the map
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [queue, setQueue] = useState<Club[]>([]);

  // Track club for popup
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [showClubInfo, setShowClubInfo] = useState(false);

  // Fetch clubs from API
  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/getClubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventID: id }),
        });

        if (!response.ok) {
          console.error("Error fetching clubs.");
          return;
        }

        const data: Club[] = await response.json();
        setClubs(data);

        const uniqueCategories = [...new Set(data.map((club) => club.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    }

    fetchClubs();
  }, [id]);

  // Initialize map and fetch clubs
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [long, lat],
      zoom: zoom,
    });

    mapRef.current = map;

    const fetchExistingClubs = async () => {
      try {
        const response = await fetch("/api/getExistingClubs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventID: id }),
        });

        if (!response.ok) {
          console.error("Error fetching existing clubs.");
          return;
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching existing clubs:", error);
      }
    };

    map.on("load", async () => {
      const existingClubs: Club[] = await fetchExistingClubs();
      existingClubs.forEach((club) => {
        if (!club.coordinates) return;

        const marker = new mapboxgl.Marker()
          .setLngLat([club.coordinates.x, club.coordinates.y])
          .addTo(map);

        marker.getElement().addEventListener("click", async (event) => {
          event.stopPropagation();
          setClubInfo({ id: club.id, name: club.name, description: club.description });
          setShowClubInfo(true);
        });
      });
    });

    map.on("move", () => {
      const mapCenter = map.getCenter();
      setLong(mapCenter.lng);
      setLat(mapCenter.lat);
      setZoom(map.getZoom());
    });

    return () => map.remove();
  }, [id, long, lat, zoom]);

  // Update queue when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const filteredQueue = clubs.filter((club) => club.category === selectedCategory);
      setQueue(filteredQueue);
    }
  }, [selectedCategory, clubs]);

  return (
    <div className="wrapper">
      <div ref={mapContainerRef} className="mapContainer" />
      {showClubInfo && clubInfo && (
        <InfoPopup club={clubInfo} onClose={() => setShowClubInfo(false)} />
      )}
      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Unplaced Clubs</h1>

        {/* Category Dropdown */}
        <div className="mb-4 w-3/5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border rounded"
          >
            <option value="">Select a category</option>
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
              <li key={club.id} className="p-4 mr-2 border-b min-w-[8vw] truncate text-center">
                {club.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
