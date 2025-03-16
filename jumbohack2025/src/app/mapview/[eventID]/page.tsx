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

  // Use refs for long, lat, zoom to avoid unnecessary re-renders
  const longRef = useRef(INITIAL_LONG);
  const latRef = useRef(INITIAL_LAT);
  const zoomRef = useRef(INITIAL_ZOOM);

  // const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // const [queue, setQueue] = useState<Club[]>([]);

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [longRef.current, latRef.current],
      zoom: zoomRef.current,
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
      // setClubs(existingClubs);

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

    // Fix: Prevent re-renders when moving the map
    map.on("move", () => {
      const mapCenter = map.getCenter();
      longRef.current = mapCenter.lng;
      latRef.current = mapCenter.lat;
      zoomRef.current = map.getZoom();
    });

    return () => map.remove();

  }, [id]); // Only re-run on ID change

  return (
    <div className="wrapper">
      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <input
            type="text"
            placeholder="Search attending clubs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shadow pl-4 pr-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-[#F7F9FB]"
        />
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
      </div>
    </div>
  );
}
