"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "./mapview.css";
import "mapbox-gl/dist/mapbox-gl.css";

// Lazy load the InfoPopup component
const InfoPopup = lazy(() => import("@/components/ClubInfo"));

interface Club {
  id: number;
  name: string;
  category: string;
  description: string;
  start_time?: string;
  end_time?: string;
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
  start_time: string;
  end_time: string;
}

interface MarkerWithLabel {
  marker: mapboxgl.Marker;
  label?: mapboxgl.Popup;
  clubName: string;
  lng: number;
  lat: number;
}

// https://docs.mapbox.com/mapbox-gl-js/example/popup/

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

const INITIAL_LONG = -71.12;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;
const LABEL_ZOOM_THRESHOLD = 15.5; // Only show labels at this zoom level or higher (increased range)
const PROXIMITY_THRESHOLD = 100; // Pixel distance threshold for label proximity

export default function MapboxMap() {
  const { eventID } = useParams<{ eventID: string }>();
  // const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [dataReady, setDataReady] = useState(false);

  // Helper to get club by coordinates with caching
  const clubCacheRef = useRef<Map<string, any>>(new Map());
  
  const getClubByCoords = useCallback(async (lng: number, lat: number) => {
    const key = `${lng.toFixed(6)},${lat.toFixed(6)}`;
    
    // Return cached result if available
    if (clubCacheRef.current.has(key)) {
      return clubCacheRef.current.get(key);
    }

    try {
      const response = await fetch("/api/getClubByCoords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "findByCoords",
          x: lng,
          y: lat,
        }),
      });

      if (!response.ok) {
        console.error("Error fetching club by coordinates.");
        return null;
      }

      const result = await response.json();
      
      // Cache the result
      clubCacheRef.current.set(key, result);
      
      return result;
    } catch (error) {
      console.error("Error fetching club:", error);
      return null;
    }
  }, []);

  // Fetch all initial data in a single optimized API call
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;

      setIsLoading(true);

      try {
        const response = await fetch("/api/getEventData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId: id }),
        });

        if (!response.ok) {
          throw new Error(`Error fetching event data: ${response.status}`);
        }

        const data = await response.json();

        // Set event name
        setEventName(data.event.name || "None");

        // Set map coordinates
        if (data.location) {
          setLong(data.location.x);
          setLat(data.location.y);
        }
        if (data.scale) {
          setZoom(data.scale);
        }

        // Set clubs data
        const clubsData = data.clubs || [];
        setClubs(clubsData);
        setQueue(clubsData);
        
        const uniqueCategories = [...new Set((clubsData as Club[]).map(club => club.category))];
        setCategories(uniqueCategories);
        setDataReady(true);

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [id]);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      // console.debug("map center/zoom", { long, lat, zoom });
    }
  }, [long, lat, zoom]);
  // Toggle labels visibility function
  const toggleLabels = () => {
    setShowLabels((prev) => !prev);
  };

  // Update label visibility based on current conditions (memoized)
  const updateLabelVisibility = useCallback(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    const map = mapRef.current;
    const currentZoom = map.getZoom();

    // Clear existing label popups and reset label references
    markersRef.current.forEach((markerInfo) => {
      if (markerInfo.label) {
        markerInfo.label.remove();
        markerInfo.label = undefined;
      }
    });

    if (!showLabels || currentZoom < LABEL_ZOOM_THRESHOLD) return;

    // Only consider visible markers (not filtered out)
    const visibleMarkers = markersRef.current.filter(({ marker }) => {
      const element = marker.getElement();
      return element.style.display !== 'none';
    });

    // Decide which labels to show based on on-screen proximity
    const shouldShowLabel = new Map<mapboxgl.Marker, boolean>();
    visibleMarkers.forEach(({ marker }) => shouldShowLabel.set(marker, true));

    for (let i = 0; i < visibleMarkers.length; i++) {
      for (let j = i + 1; j < visibleMarkers.length; j++) {
        const markerA = visibleMarkers[i].marker;
        const markerB = visibleMarkers[j].marker;

        const posA = map.project(markerA.getLngLat());
        const posB = map.project(markerB.getLngLat());
        const distance = Math.hypot(posA.x - posB.x, posA.y - posB.y);

        if (distance < PROXIMITY_THRESHOLD) {
          shouldShowLabel.set(markerA, false);
          shouldShowLabel.set(markerB, false);
        }
      }
    }

    // Add popups only for visible markers that we chose to show
    visibleMarkers.forEach((markerInfo) => {
      const { marker, clubName, lng, lat } = markerInfo;
      if (shouldShowLabel.get(marker)) {
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -30],
          className: "club-label-popup",
        })
          .setLngLat([lng, lat])
          .setHTML(`<div class="club-label">${clubName}</div>`)
          .addTo(map);

        markerInfo.label = popup;
      }
    });
  }, [showLabels]);

  // Store updateLabelVisibility in ref to avoid dependency issues
  const updateLabelVisibilityRef = useRef(updateLabelVisibility);
  updateLabelVisibilityRef.current = updateLabelVisibility;

  // Initialize the map only once when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map with current coordinates (fallback to defaults if not set)
    const map = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [long || INITIAL_LONG, lat || INITIAL_LAT],
      zoom: zoom || INITIAL_ZOOM,
    });
    mapRef.current = map;

    // Map event handlers - set up once
    map.on("move", () => {
      const mapCenter = map.getCenter();
      setLong(mapCenter.lng);
      setLat(mapCenter.lat);
      setZoom(map.getZoom());
    });

    // Debounce label updates to improve performance
    let labelUpdateTimeout: NodeJS.Timeout;
    const debouncedLabelUpdate = () => {
      clearTimeout(labelUpdateTimeout);
      labelUpdateTimeout = setTimeout(() => updateLabelVisibilityRef.current(), 100);
    };

    map.on("moveend", debouncedLabelUpdate);
    map.on("zoomend", debouncedLabelUpdate);

    // When map loads, setup markers
    map.on("load", () => {
      setMapReady(true);
    });

    return () => {
      if (labelUpdateTimeout) clearTimeout(labelUpdateTimeout);
      mapRef.current = null;
      map.remove();
    };
  }, []); // No dependencies - only create once

  // Update map center when we get new coordinates from API (only if map hasn't been moved by user)
  const [hasUserMovedMap, setHasUserMovedMap] = useState(false);
  
  useEffect(() => {
    if (!mapRef.current || hasUserMovedMap) return;
    
    // Only update if we have specific coordinates from the API (not defaults)
    if (long !== INITIAL_LONG || lat !== INITIAL_LAT) {
      mapRef.current.setCenter([long, lat]);
      if (zoom !== INITIAL_ZOOM) {
        mapRef.current.setZoom(zoom);
      }
    }
  }, [long, lat, zoom, hasUserMovedMap]);

  // Track when user moves the map
  useEffect(() => {
    if (!mapRef.current) return;
    
    const handleUserMove = () => {
      setHasUserMovedMap(true);
    };
    
    mapRef.current.on("dragstart", handleUserMove);
    mapRef.current.on("zoomstart", handleUserMove);
    
    return () => {
      if (mapRef.current) {
        mapRef.current.off("dragstart", handleUserMove);
        mapRef.current.off("zoomstart", handleUserMove);
      }
    };
  }, []);

  // Track previous clubs to avoid unnecessary marker recreation
  const prevClubsRef = useRef<Club[]>([]);
  
  // Effect to add markers when both map and data are ready
  useEffect(() => {
    if (!mapRef.current || !mapReady || !dataReady || !clubs.length) return;

    // Check if clubs actually changed
    if (prevClubsRef.current.length === clubs.length && 
        prevClubsRef.current.every((prevClub, index) => 
          prevClub.id === clubs[index]?.id && 
          prevClub.coordinates?.x === clubs[index]?.coordinates?.x &&
          prevClub.coordinates?.y === clubs[index]?.coordinates?.y
        )) {
      return; // No changes, skip marker recreation
    }

    const map = mapRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(({ marker, label }) => {
      marker.remove();
      if (label) label.remove();
    });
    markersRef.current = [];

    // Add markers for each club
    clubs.forEach((club) => {
      if (!club.coordinates) return;

      const lng = club.coordinates.x;
      const lat = club.coordinates.y;

      const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);

      marker.getElement().addEventListener("click", async (event) => {
        event.stopPropagation();
        const { lng, lat } = marker.getLngLat();
        const clubData = await getClubByCoords(lng, lat);
        if (clubData) {
          setClubInfo({
            id: clubData.id,
            name: clubData.name,
            description: clubData.description,
            start_time: clubData.start_time || "",
            end_time: clubData.end_time || "",
          });
          setShowClubInfo(true);
        }
      });

      markersRef.current.push({
        marker,
        clubName: club.name,
        lng,
        lat,
      });
    });

    // Update the previous clubs reference
    prevClubsRef.current = [...clubs];

    // Apply initial label visibility
    updateLabelVisibilityRef.current();
  }, [clubs, mapReady, dataReady]);

  // Memoize filtered clubs to prevent unnecessary re-calculations
  const filteredClubs = useMemo(() => {
    const searchLower = search.toLowerCase();
    return selectedCategory === ""
      ? clubs.filter((club) =>
          club.name.toLowerCase().includes(searchLower)
        )
      : clubs.filter(
          (club) =>
            club.category === selectedCategory &&
            club.name.toLowerCase().includes(searchLower)
        );
  }, [clubs, selectedCategory, search]);

  // Optimize marker updates - only show/hide markers instead of recreating them
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return;

    const filteredClubIds = new Set(filteredClubs.map(club => club.id));

    // Show/hide existing markers instead of recreating them
    markersRef.current.forEach((markerInfo) => {
      const { marker, clubName } = markerInfo;
      const clubInFiltered = filteredClubs.some(club => club.name === clubName);
      const element = marker.getElement();
      
      if (clubInFiltered) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
        // Also hide the label if marker is hidden and clear reference
        if (markerInfo.label) {
          markerInfo.label.remove();
          markerInfo.label = undefined;
        }
      }
    });

    // Add new markers for clubs that don't have markers yet
    const existingClubNames = new Set(markersRef.current.map(m => m.clubName));
    
    filteredClubs.forEach((club) => {
      if (existingClubNames.has(club.name)) return; // Skip if marker already exists
      
      const lng = club.coordinates ? club.coordinates.x : club.x;
      const lat = club.coordinates ? club.coordinates.y : club.y;
      if (lng == null || lat == null) return;

      const marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current!);

      marker.getElement().addEventListener("click", async (event) => {
        event.stopPropagation();
        const { lng, lat } = marker.getLngLat();
        const clubData = await getClubByCoords(lng, lat);
        if (clubData) {
          setClubInfo({
            id: clubData.id,
            name: clubData.name,
            description: clubData.description,
            start_time: clubData.start_time || "",
            end_time: clubData.end_time || "",
          });
          setShowClubInfo(true);
        }
      });

      markersRef.current.push({
        marker,
        clubName: club.name,
        lng,
        lat,
      });
    });

    // Refresh label visibility based on current state (debounced)
    const timeoutRef = setTimeout(() => {
      updateLabelVisibilityRef.current();
    }, 50); // Slightly longer delay for better performance
    
    return () => clearTimeout(timeoutRef);
  }, [filteredClubs]);

  useEffect(() => {
    // Small delay to ensure state changes are applied
    const timeoutRef = setTimeout(() => {
      updateLabelVisibilityRef.current();
    }, 10);
    
    return () => clearTimeout(timeoutRef);
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
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading event data...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-[1%] min-w-[25%] absolute z-10">
          <input
            type="text"
            placeholder="Search attending clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shadow pl-4 pr-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-[#F7F9FB] mt-2"
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div ref={mapContainerRef} className="mapContainer">
        {!mapReady && !isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-gray-600">Initializing map...</div>
          </div>
        )}
      </div>

      {showClubInfo && clubInfo && (
        <Suspense fallback={<div>Loading...</div>}>
          <InfoPopup
            club={clubInfo}
            onClose={() => setShowClubInfo(false)}
            onEdit={null}
            onMove={null}
          />
        </Suspense>
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
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {useMemo(() => 
                categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                )), [categories]
              )}
            </select>
          </div>

            <div className="flex items-center bg-categoryBg shadow px-6 py-4 ml-auto mt-4 md:mt-0">
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
          <ul
            className="
              flex flex-col md:flex-row
              overflow-y-auto md:overflow-x-auto
              max-h-100 md:max-h-none
            "
          >
            {useMemo(() => 
              queue.map((club) => (
                <li
                  key={club.id}
                  className="
                    p-4 mb-2 md:mr-2
                    bg-categoryBg
                    w-full min-w-[20vw] lg:min-w-[10vw]
                    truncate text-center
                  "
                >
                  {club.name}
                </li>
              )), [queue]
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
