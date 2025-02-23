"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation"
import mapboxgl from "mapbox-gl";
import InfoPopup from "@/components/ClubInfo";
import "./mapview.css";
import "mapbox-gl/dist/mapbox-gl.css";

interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
  // Support both formats for coordinates:
  coordinates?: {
    x: number;
    y: number;
  };
  x?: number;
  y?: number;
}

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;

export default function MapboxMap() {
  const id = useParams().eventID;
  console.log(id)

  // Map container and map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // Store markers so we can clear them later
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initial position of map
  const [long, setLong] = useState(INITIAL_LONG);
  const [lat, setLat] = useState(INITIAL_LAT);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  // Keep track of clubs to add to map
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [queue, setQueue] = useState<Club[]>([]);

  // Track club to show popup for
  const [clubInfo, setClubInfo] = useState<any>();
  const [showClubInfo, setShowClubInfo] = useState(false);

  // Search state
  const [search, setSearch] = useState('');

  // Helper function to fetch club info based on coordinates
  const getClubByCoords = async (lng: number, lat: number) => {
    try {
      const response = await fetch("/api/getClubByCoords", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: lng, y: lat }),
      });

      if (!response.ok) {
        console.log("Error fetching club by coordinates.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error: " + error);
    }
  };

  // Create map on initial load
  useEffect(() => {
    if (!mapContainerRef.current) return;

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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventID: id
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
        setClubs(existingClubs);
        const uniqueCategories = [...new Set(existingClubs.map((club: Club) => club.category))];
        setCategories(uniqueCategories);
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

    mapRef.current.on("move", () => {
      // Get the current center coordinates and zoom level from the map
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();
      setLong(mapCenter.lng);
      setLat(mapCenter.lat);
      setZoom(mapZoom);
    });

    return () => map.remove();
  }, []);

  // Fetch clubs data using eventId
  const eventId = 1;
  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("/api/holdenRoute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (status: ${response.status})`);
        }

        const data: Club[] = await response.json();
        setClubs(data);
        // Extract unique categories from fetched clubs
        const uniqueCategories = [...new Set(data.map((club: Club) => club.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    }

    fetchClubs();
  }, [eventId]);

  // Update queue when category is selected (used in the UI list below)
  useEffect(() => {
    if (selectedCategory) {
      // Filter clubs by category (and optionally by coordinate existence)
      const filteredQueue = clubs.filter(
        (club) =>
          club.category === selectedCategory &&
          ((club.x === undefined || club.x === null) &&
            (club.y === undefined || club.y === null))
      );
      setQueue(filteredQueue);
    }
  }, [selectedCategory, clubs]);

  // Compute filtered clubs based on search and category.
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? club.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Update map markers whenever the filtered clubs change.
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add a marker for each club in the filtered list
      filteredClubs.forEach((club) => {
        // Determine coordinates (supports both club.coordinates and club.x/club.y)
        const lng = club.coordinates ? club.coordinates.x : club.x;
        const lat = club.coordinates ? club.coordinates.y : club.y;
        if (lng == null || lat == null) return; // Skip if no coordinates

        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);

        // Attach click event to marker
        marker.getElement().addEventListener("click", async (event) => {
          event.stopPropagation();
          const { lng, lat } = marker.getLngLat();
          const clubData = await getClubByCoords(lng, lat);
          if (clubData) {
            setClubInfo({
              id: clubData.id,
              name: clubData.name,
              description: clubData.description,
            });
            setShowClubInfo(true);
          }
        });

        markersRef.current.push(marker);
      });
    };

    if (!mapRef.current.loaded()) {
      mapRef.current.on("load", updateMarkers);
      return () => mapRef.current?.off("load", updateMarkers);
    } else {
      updateMarkers();
    }
  }, [filteredClubs]);

  return (
    <div className="wrapper">
      {/* Search Bar */}
      <div className="flex items-center mb-4 pt-4 px-10">
        <input
          type="text"
          placeholder="Search attending clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded border-gray-300"
        />
        <button
          type="button"
          className="ml-2 p-2 rounded bg-gray-200 border-none cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.867-3.867zM12.5 6.5a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>
      </div>
      <div ref={mapContainerRef} className="mapContainer" />
      {showClubInfo && (
        <InfoPopup club={clubInfo} onClose={() => setShowClubInfo(false)} />
      )}
      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4">Student Org. Club Fair</h1>

        {/* Category Dropdown */}
        <div className="mb-4 w-3/5 bg-categoryBg">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-4 border rounded bg-categoryBg"
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
              <li key={club.id} className="mr-2">
                <button
                  className="p-4 border-b bg-categoryBg min-w-[8vw] truncate text-center w-full"
                  onClick={() => {
                    setClubInfo(club);
                    setShowClubInfo(true);
                  }}
                >
                  {club.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}