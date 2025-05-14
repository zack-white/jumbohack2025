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
}

mapboxgl.accessToken = "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;

export default function MapboxMap() {
  const { eventID } = useParams();
  const [eventName, setEventName] = useState("None");
  const id = Number(eventID); // Ensure ID is a number
  console.log("Event ID:", id);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<MarkerWithLabel[]>([]); // Updated to include labels

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
  const [showLabels, setShowLabels] = useState(true); // New state for toggle

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
        console.log(data);
        setEventName(data[0].name); // Assuming the API returns an array
      } catch (error) {
        console.error("Error fetching event name:", error);
      }
    };

    if (id) {
      fetchEventName();
    }
  }, [id]);

  // Function to toggle label visibility based on current state
  const toggleLabels = () => {
    const newShowLabels = !showLabels;
    setShowLabels(newShowLabels);
    updateLabelsVisibility(newShowLabels);
  };

  // Function to update all labels visibility
  const updateLabelsVisibility = (visible: boolean) => {
    markersRef.current.forEach(({ label }) => {
      if (label) {
        if (visible) {
          label.addTo(mapRef.current!);
        } else {
          label.remove();
        }
      }
    });
  };

  // Check if labels should be shown based on zoom level and proximity
  const shouldShowLabelsAtZoom = (currentZoom: number) => {
    // Only show labels if zoom is high enough (less cluttered)
    return currentZoom >= 16;
  };
  
  // Calculate if markers are too close to each other
  const checkMarkerProximity = () => {
    if (!mapRef.current) return;
    
    const markers = markersRef.current;
    const tooCloseThreshold = 100; // pixel distance threshold
    
    // Create a map to track which markers should hide their labels
    const shouldHideLabel = new Map<mapboxgl.Marker, boolean>();
    markers.forEach(({ marker }) => shouldHideLabel.set(marker, false));
    
    // Check each pair of markers for proximity
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const markerA = markers[i].marker;
        const markerB = markers[j].marker;
        
        // Convert coordinates to pixel positions
        const posA = mapRef.current.project(markerA.getLngLat());
        const posB = mapRef.current.project(markerB.getLngLat());
        
        // Calculate pixel distance
        const distance = Math.sqrt(
          Math.pow(posA.x - posB.x, 2) + Math.pow(posA.y - posB.y, 2)
        );
        
        // If markers are too close, hide their labels
        if (distance < tooCloseThreshold) {
          shouldHideLabel.set(markerA, true);
          shouldHideLabel.set(markerB, true);
        }
      }
    }
    
    // Apply visibility based on proximity check
    markers.forEach(({ marker, label }) => {
      if (label) {
        if (shouldHideLabel.get(marker)) {
          label.remove();
        } else if (showLabels && shouldShowLabelsAtZoom(mapRef.current!.getZoom())) {
          label.addTo(mapRef.current!);
        }
      }
    });
  };

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      try {
        console.log("Fetching map location for this event:", id);
        
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
        
        // Use the fetched coordinates directly
        let mapLong = long;
        let mapLat = lat;
        let mapZoom = zoom;
        
        if (data.location) {
          mapLong = data.location.x;
          mapLat = data.location.y;
          console.log("UPDATED MAP POSITION to:", mapLong, mapLat);
          
          // Update state for other components
          setLong(mapLong);
          setLat(mapLat);
        }
        
        if (data.scale) {
          mapZoom = data.scale;
          setZoom(mapZoom);
        }

        // Create map with directly fetched coordinates
        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [mapLong, mapLat],
          zoom: mapZoom,
        });
        mapRef.current = map;

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

          // Create new markers with labels
          existingClubs.forEach((club) => {
            if (!club.coordinates) return;

            const marker = new mapboxgl.Marker()
              .setLngLat([club.coordinates.x, club.coordinates.y])
              .addTo(map);

            // Create a popup for the club name
            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: [0, -30], // Offset so it appears above the marker
              className: 'club-label-popup'
            })
              .setLngLat([club.coordinates.x, club.coordinates.y])
              .setHTML(`<div class="club-label">${club.name}</div>`);

            // Only add the popup if labels are enabled
            if (showLabels && shouldShowLabelsAtZoom(map.getZoom())) {
              popup.addTo(map);
            }

            marker.getElement().addEventListener("click", async (event) => {
              event.stopPropagation();
              const { lng, lat } = marker.getLngLat();
              const club = await getClubByCoords(lng, lat);
              if (club) {
                setClubInfo({ id: club.id, name: club.name, description: club.description });
                setShowClubInfo(true);
              }
            });

            markersRef.current.push({ marker, label: popup });
          });
        });

        // Update state when moving the map
        map.on("move", () => {
          const mapCenter = map.getCenter();
          setLong(mapCenter.lng);
          setLat(mapCenter.lat);
          setZoom(map.getZoom());
          
          // Check for proximity during map movement and update labels
          if (showLabels) {
            checkMarkerProximity();
          } else {
            // Ensure labels are hidden when toggle is off
            markersRef.current.forEach(({ label }) => {
              if (label) label.remove();
            });
          }
        });

        // Update label visibility when zoom changes
        map.on("zoom", () => {
          const currentZoom = map.getZoom();
          
          // If labels are enabled in UI, check zoom level and proximity
          if (showLabels) {
            const shouldShow = shouldShowLabelsAtZoom(currentZoom);
            if (shouldShow) {
              checkMarkerProximity();
            } else {
              // Hide all labels when zoom is too low
              markersRef.current.forEach(({ label }) => {
                if (label) label.remove();
              });
            }
          } else {
            // Ensure labels are hidden when toggle is off during zoom
            markersRef.current.forEach(({ label }) => {
              if (label) label.remove();
            });
          }
        });

        return () => {
          map.remove();
        };
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    initializeMap();
  }, [id]); // Only re-run on ID change

  // Compute filtered clubs based on the search input and current category.
  const filteredClubs = selectedCategory === ""? clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  ): clubs.filter((club) =>
    club.category === selectedCategory &&
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  // Update map markers whenever the filtered clubs change.
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = () => {
      // Remove existing markers and labels
      markersRef.current.forEach(({ marker, label }) => {
        marker.remove();
        if (label) label.remove();
      });
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

        // Create a popup for the club name
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -30], // Offset so it appears above the marker
          className: 'club-label-popup'
        })
          .setLngLat([lng, lat])
          .setHTML(`<div class="club-label">${club.name}</div>`);

        // Only add the popup if labels are enabled and zoom is appropriate
        if (showLabels && shouldShowLabelsAtZoom(mapRef.current!.getZoom())) {
          popup.addTo(mapRef.current!);
        }

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

        markersRef.current.push({ marker, label: popup });
      });
    };

    if (!mapRef.current.loaded()) {
      mapRef.current.on("load", updateMarkers);
      return () => {
        if (mapRef.current) {
          mapRef.current.off("load", updateMarkers);
        }
      };
    } else {
      updateMarkers();
    }
  }, [filteredClubs, showLabels]);

  // Effect to update label visibility when the showLabels state changes
  useEffect(() => {
    if (!mapRef.current || !mapRef.current.loaded()) return;
    
    if (showLabels) {
      const currentZoom = mapRef.current.getZoom();
      if (shouldShowLabelsAtZoom(currentZoom)) {
        // Check proximity before showing labels
        checkMarkerProximity();
      }
    } else {
      // When labels are disabled, ensure all labels are removed
      markersRef.current.forEach(({ label }) => {
        if (label) label.remove();
      });
    }
  }, [showLabels]);

  // Update queue when category is selected
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (selectedCategory === "") {
      setQueue(clubs);
      return;
    } else {
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

        <div className="flex flex-col md:flex-row gap-4 mb-4">
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

          <div className="flex items-center bg-white rounded-full shadow px-4 py-2">
            <span className="mr-2">Show Labels</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showLabels ? "bg-blue-600" : "bg-gray-200"
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