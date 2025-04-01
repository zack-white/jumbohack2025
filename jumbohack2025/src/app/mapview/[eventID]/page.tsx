"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import InfoPopup from "@/components/ClubInfo";
import "./mapview.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { Club } from "lucide-react";
// import { set } from "date-fns";

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
  const markersRef = useRef<mapboxgl.Marker[]>([]);

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

  // Initialize the map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initializeMap = async () => {
      const updateMap = async () => {
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
  
          if (data.location) {
            setLong(data.location.x);
            setLat(data.location.y);
            console.log("UPDATED MAP POSITION")
          }
          if (data.scale) {
            setZoom(data.scale);
          }
  
          return data;
        } catch(error) {
          console.error("Error fetching map location:", error);
          return [];
        }
      };
  
      // Get updated coordinates first
      const locationData = await updateMap();
      
      // Use the fetched coordinates directly instead of using state
      let mapLong = long;
      let mapLat = lat;
      let mapZoom = zoom;
      
      if (locationData && locationData.location) {
        mapLong = locationData.location.x;
        mapLat = locationData.location.y;
        console.log("UPDATED MAP POSITION to:", mapLong, mapLat);
        
        // Also update state for other components that might need it
        setLong(mapLong);
        setLat(mapLat);
      }
      
      if (locationData && locationData.scale) {
        mapZoom = locationData.scale;
        setZoom(mapZoom);
      }

      // Create map with directly fetched coordinates
      const map = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [mapLong, mapLat], // Use direct variables, not state
        zoom: mapZoom, // Use direct variable, not state
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
        }
      };

      map.on("load", async () => {
        const existingClubs: Club[] = await getExistingClubs();
        setClubs(existingClubs);
        setQueue(existingClubs);

        const uniqueCategories = [...new Set(existingClubs.map((club) => club.category))];
        setCategories(uniqueCategories);

        existingClubs.forEach((club) => {
          if (!club.coordinates) return;

          const marker = new mapboxgl.Marker()
            .setLngLat([club.coordinates.x, club.coordinates.y])
            .addTo(map);

          marker.getElement().addEventListener("click", async (event) => {
            event.stopPropagation();
            const { lng, lat } = marker.getLngLat();
            const club = await getClubByCoords(lng, lat);
            if (club) {
              setClubInfo({ id: club.id, name: club.name, description: club.description });
              setShowClubInfo(true);
            }
          });

          markersRef.current.push(marker);
        });
      });

      // Update state when moving the map
      map.on("move", () => {
        const mapCenter = map.getCenter();
        setLong(mapCenter.lng);
        setLat(mapCenter.lat);
        setZoom(map.getZoom());
      });

      return () => {
        map.remove();
      };
    };

    initializeMap();
  }, [id]); // Only re-run on ID change

  // Compute filtered clubs based on the search input and current category.
  // When search is empty, all clubs are shown.
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
      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
  
      // Add a marker for each club in the filtered list
      filteredClubs.forEach((club) => {
        const lng = club.coordinates ? club.coordinates.x : club.x;
        const lat = club.coordinates ? club.coordinates.y : club.y;
        if (lng == null || lat == null) return;
  
        const marker = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current!);
  
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
        console.log("Marker added:", { lng, lat });
      });
    };
  
    if (!mapRef.current.loaded()) {
      mapRef.current.on("load", updateMarkers);
      return () => {
        mapRef.current?.off("load", updateMarkers);
      };
    } else {
      updateMarkers();
    }
  }, [filteredClubs]);
  

  useEffect(() => {
    if (!mapRef.current) return;
  
    if (selectedCategory === "") {
      setQueue(clubs);
    } else {
      // Filter clubs by category (and optionally by coordinate existence)
      const filteredQueue = clubs.filter(
        (club) =>
          club.category === selectedCategory &&
          ((club.x === undefined || club.x === null) &&
           (club.y === undefined || club.y === null))
      );
      setQueue(filteredQueue);
  
      const updateMarkers = () => {
        // Remove existing markers
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
        console.log("markersRef", markersRef.current);
  
        // Add a marker for each club in the filtered list
        filteredQueue.forEach((club) => {
          console.log("Adding marker for club:", club);
          const lng = club.coordinates ? club.coordinates.x : club.x;
          const lat = club.coordinates ? club.coordinates.y : club.y;
          if (lng == null || lat == null) return;
  
          const marker = new mapboxgl.Marker()
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);
  
          console.log("Marker added:", { lng, lat });
  
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
          console.log("markersRef after push", markersRef.current);
        });
      };
  
      if (!mapRef.current.loaded()) {
        console.log("Map not loaded yet, waiting...");
        mapRef.current.on("load", updateMarkers);
  
        return () => {
          mapRef.current?.off("load", updateMarkers);
        };
      } else {
        console.log("Map loaded, updating markers...");
        updateMarkers();
      }
    }
  
    return;
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
        <h1 className="text-xl md:text-2xl font-bold mb-4 font-serif">{eventName}</h1>

        <div className="mb-4 w-3/5">
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