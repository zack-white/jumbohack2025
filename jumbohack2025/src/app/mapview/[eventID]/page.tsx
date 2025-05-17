"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import InfoPopup from "@/components/ClubInfo";
import "./mapview.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Club } from "lucide-react";

interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
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

interface MarkerWithLabel {
  marker: mapboxgl.Marker;
  label?: mapboxgl.Popup;
  clubName: string;
  lng: number;
  lat: number;
}

// https://docs.mapbox.com/mapbox-gl-js/example/popup/

mapboxgl.accessToken = "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;
const LABEL_ZOOM_THRESHOLD = 16; // Only show labels at this zoom level or higher
const PROXIMITY_THRESHOLD = 100; // Pixel distance threshold for label proximity

export default function MapboxMap() {
  const { eventID } = useParams();
  const [eventName, setEventName] = useState("None");
  const id = Number(eventID);
  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<MarkerWithLabel[]>([]);

  const [long, setLong] = useState(INITIAL_LONG);
  const [lat, setLat] = useState(INITIAL_LAT);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [queue, setQueue] = useState<Club[]>([]);

  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [showClubInfo, setShowClubInfo] = useState(false);
  const [search, setSearch] = useState("");
  const [showLabels, setShowLabels] = useState(true);

  // Helper to get club by coordinates
  const getClubByCoords = async (lng: number, lat: number) => {
    try {
      const response = await fetch("/api/getClubByCoords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: lng, y: lat }),
      });

      if (!response.ok) {
        console.error("Error fetching club by coordinates.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching club:", error);
    }
  };

  // Fetch event name based on ID
  useEffect(() => {
    const fetchEventName = async () => {
      try {
        const response = await fetch("/api/fetchEvent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching event name (status: ${response.status})`);
        }

        const data = await response.json();
        setEventName(data[0].name);
      } catch (error) {
        console.error("Error fetching event name:", error);
      }
    };

    if (id) {
      fetchEventName();
    }
  }, [id]);

  // Toggle labels visibility function
  const toggleLabels = () => {
    setShowLabels(prev => !prev);
  };

  // Calculate if two points are too close to each other
  const arePointsTooClose = (pointA: mapboxgl.Point, pointB: mapboxgl.Point): boolean => {
    const distance = Math.sqrt(
      Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
    );
    return distance < PROXIMITY_THRESHOLD;
  };

  // Check which markers should have visible labels based on proximity
  const calculateLabelVisibility = (): Map<mapboxgl.Marker, boolean> => {
    if (!mapRef.current) return new Map();
    
    const map = mapRef.current;
    const markers = markersRef.current;
    const shouldShowLabel = new Map<mapboxgl.Marker, boolean>();
    
    // Default: all markers should show labels
    markers.forEach(({ marker }) => shouldShowLabel.set(marker, true));
    
    // Check each pair of markers
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const markerA = markers[i].marker;
        const markerB = markers[j].marker;
        
        const posA = map.project(markerA.getLngLat());
        const posB = map.project(markerB.getLngLat());
        
        if (arePointsTooClose(posA, posB)) {
          shouldShowLabel.set(markerA, false);
          shouldShowLabel.set(markerB, false);
        }
      }
    }
    
    return shouldShowLabel;
  };

  // Update label visibility based on current conditions
  const updateLabelVisibility = () => {
    if (!mapRef.current || !mapRef.current.loaded()) return;
    
    const map = mapRef.current;
    const currentZoom = map.getZoom();
    
    markersRef.current.forEach(({ label }) => {
      if (label) label.remove();
    });
    
    if (!showLabels || currentZoom < LABEL_ZOOM_THRESHOLD) {
      return;
    }
    
    const shouldShowLabel = calculateLabelVisibility();
    
    markersRef.current.forEach((markerInfo) => {
      const { marker, clubName, lng, lat } = markerInfo;
      
      if (shouldShowLabel.get(marker)) {
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -30],
          className: 'club-label-popup'
        })
          .setLngLat([lng, lat])
          .setHTML(`<div class="club-label">${clubName}</div>`)
          .addTo(map);
        
        markerInfo.label = popup;
      }
    });
  };

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        // Fetch map location for this event
        const response = await fetch("/api/getEventLocation", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventID: id
          })
        });

        if (!response.ok) {
          console.error("Error fetching map location:", response.status);
          return;
        }

        const data = await response.json();
        
        // Use fetched coordinates if available
        let mapLong = long;
        let mapLat = lat;
        let mapZoom = zoom;
        
        if (data.location) {
          mapLong = data.location.x;
          mapLat = data.location.y;
          setLong(mapLong);
          setLat(mapLat);
        }
        
        if (data.scale) {
          mapZoom = data.scale;
          setZoom(mapZoom);
        }

        // Create map
        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [mapLong, mapLat],
          zoom: mapZoom,
        });
        mapRef.current = map;

        // Get existing clubs
        const getExistingClubs = async () => {
          try {
            const response = await fetch("/api/getExistingClubs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ eventID: id }),
            });

            if (!response.ok) {
              console.error("Error fetching existing clubs.");
            }

            return await response.json();
          } catch (error) {
            console.error("Error fetching clubs:", error);
            return [];
          }
        };

        // When map loads, setup markers
        map.on("load", async () => {
          const existingClubs: Club[] = await getExistingClubs();
          setClubs(existingClubs);
          setQueue(existingClubs);

          const uniqueCategories = [...new Set(existingClubs.map((club) => club.category))];
          setCategories(uniqueCategories);

          // Clear existing markers
          markersRef.current.forEach(({ marker, label }) => {
            marker.remove();
            if (label) label.remove();
          });
          markersRef.current = [];

          // Add markers for each club
          existingClubs.forEach((club) => {
            if (!club.coordinates) return;
            
            const lng = club.coordinates.x;
            const lat = club.coordinates.y;

            const marker = new mapboxgl.Marker()
              .setLngLat([lng, lat])
              .addTo(map);

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

            markersRef.current.push({
              marker,
              clubName: club.name,
              lng,
              lat
            });
          });
          
          // Apply initial label visibility
          updateLabelVisibility();
        });

        // Map event handlers
        map.on("move", () => {
          const mapCenter = map.getCenter();
          setLong(mapCenter.lng);
          setLat(mapCenter.lat);
          setZoom(map.getZoom());
        });
        
        map.on("moveend", () => {
          updateLabelVisibility();
        });

        map.on("zoomend", () => {
          updateLabelVisibility();
        });

        return () => {
          map.remove();
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, [id]);

  // Compute filtered clubs based on search input and category
  const filteredClubs = selectedCategory === ""
    ? clubs.filter((club) => club.name.toLowerCase().includes(search.toLowerCase()))
    : clubs.filter((club) =>
        club.category === selectedCategory &&
        club.name.toLowerCase().includes(search.toLowerCase())
      );

  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    const map = mapRef.current;
    
    markersRef.current.forEach(({ marker, label }) => {
      marker.remove();
      if (label) label.remove();
    });
    markersRef.current = [];

    // Add markers for each filtered club
    filteredClubs.forEach((club) => {
      const lng = club.coordinates ? club.coordinates.x : club.x;
      const lat = club.coordinates ? club.coordinates.y : club.y;
      if (lng == null || lat == null) return; // Skip if no coordinates

      const marker = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

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

      markersRef.current.push({
        marker,
        clubName: club.name,
        lng,
        lat
      });
    });
    
    // Refresh label visibility based on current state
    updateLabelVisibility();
  }, [filteredClubs]);

  useEffect(() => {
    updateLabelVisibility();
  }, [showLabels]);

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (selectedCategory === "") {
      setQueue(clubs);
    } else {
      // Filter clubs by category and coordinate existence
      const filteredQueue = clubs.filter(
        (club) =>
          club.category === selectedCategory &&
          ((club.x === undefined || club.x === null) &&
            (club.y === undefined || club.y === null))
      );
      setQueue(filteredQueue);
    }
  }, [selectedCategory, clubs]);

  return (
    <div className="wrapper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-[1%] min-w-[25%] absolute z-10">
            <input
                type="text"
                placeholder="Search attending clubs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="shadow pl-4 pr-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-[#F7F9FB]"
            />
        </div>
      </div>
      <div ref={mapContainerRef} className="mapContainer" />

      {showClubInfo && clubInfo && (
        <InfoPopup club={clubInfo} onClose={() => setShowClubInfo(false)} />
      )}

      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold font-serif">{eventName}</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="w-full md:w-3/5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border shadow text-[#23394A] font-inter bg-[#F7F9FB] focus:ring-2 focus:ring-blue-50"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-categoryBg shadow px-6 py-4 ml-auto">
            <span className="mr-2">Show Labels</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showLabels ? "bg-[#2E73B5]" : "bg-gray-200"
              }`}
              onClick={toggleLabels}
              aria-pressed={showLabels}
              type="button"
            >
              <span className="sr-only">Toggle labels</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showLabels ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
        
        {/* Queue */}
        <div className="mb-4">
           <ul className="flex flex-row overflow-auto">
             {queue.map((club) => (
               <li
                 key={club.id}
                 className="p-4 mr-2 border-b bg-categoryBg min-w-[8vw] truncate text-center"
               >
                 {club.name}
               </li>
             ))}
           </ul>
         </div>
      </div>
    </div>
  );
}