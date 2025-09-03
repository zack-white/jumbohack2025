"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
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

mapboxgl.accessToken =
  "pk.eyJ1Ijoic2FsbW9uLXN1c2hpIiwiYSI6ImNtN2dqYWdrZzA4ZnIyam9qNWx1NnAybjcifQ._YD8GYWPtpZ09AwYHzR2Og";

const INITIAL_LONG = -71.120;
const INITIAL_LAT = 42.4075;
const INITIAL_ZOOM = 17.33;

export default function MapboxMap() {
  const id = useParams().eventID;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // For now this really only loads the proper map going from the create event to
  // the placement page -- later should fix
  const paramLong = searchParams.get('x') ? parseFloat(searchParams.get('x') || '') : INITIAL_LONG;
  const paramLat = searchParams.get('y') ? parseFloat(searchParams.get('y') || '') : INITIAL_LAT;
  const paramZoom = searchParams.get('scale') ? parseFloat(searchParams.get('scale') || '') : INITIAL_ZOOM;

  // Map container and map instance
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Initial position of map - now using URL parameters if available
  const [long, setLong] = useState(paramLong);
  const [lat, setLat] = useState(paramLat);
  const [zoom, setZoom] = useState(paramZoom);

  // Keep track of clubs to add to map
  const [clubs, setClubs] = useState<Club[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [queue, setQueue] = useState<Club[]>([]);

  // Placement mode on map
  const [placementMode, setPlacementMode] = useState(true);

  // Track club to show popup for
  const [clubInfo, setClubInfo] = useState<Club>();
  const [showClubInfo, setShowClubInfo] = useState(false);

  // consts for sending emails
  const [status, setStatus] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // On page render, create map and fetch all old clubs w/ for given event.
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
  
      // Function to fetch all existing clubs to add to map
      const getExistingClubs = async () => {
        try {
            console.log("Fetching existing clubs for event ID:", id);
            
            const response = await fetch("/api/getExistingClubs", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventID: id
                })
            });
    
            if (!response.ok) {
                console.error("Error fetching existing clubs:", response.status);
                return [];
            }
    
            const data = await response.json();
            console.log("Existing clubs data:", data);
            return data;
        } catch(error) {
            console.error("Error fetching existing clubs:", error);
            return [];
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
                      action: 'findByCoords',
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
  
      map.on("load", async () => {
        const existingClubs = await getExistingClubs();
        existingClubs.forEach((club:Club) => {
            if (!club.coordinates) return; 
  
            const marker = new mapboxgl.Marker()
                .setLngLat([club.coordinates.x, club.coordinates.y])
                .addTo(map);
  
            marker.getElement().addEventListener("click", async (event) => {
                event.stopPropagation();
  
                const { lng, lat } = marker.getLngLat();
                const fetchedClub = await getClubByCoords(lng, lat);
  
                if (fetchedClub) {
                    setClubInfo({
                        id: fetchedClub.id,
                        name: fetchedClub.name,
                        description: fetchedClub.description,
                        category: fetchedClub.category,
                    });
                    setShowClubInfo(true);
                }
            });
        });
      });
    
  
      async function fetchClubs() {
        try {
          const eventIDFromParams = id;
          console.log("Fetching clubs for event ID:", eventIDFromParams);
          
          const response = await fetch("/api/getClubs", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventID: eventIDFromParams
              })
          });
  
          if (!response.ok) {
              console.error("Error fetching clubs:", response.status);
              return;
          }
  
          const data = await response.json();
          console.log("Fetched clubs:", data);
          setClubs(data);
          
          // Extract unique categories
          const uniqueCategories: string[] = Array.from(new Set<string>(data.map((club: Club) => club.category))) as string[];
          setCategories(uniqueCategories);
  
        } catch(error) {
          console.error("Error fetching clubs:", error);
        }
      };
    
      // Fetch clubs on page load
      setTimeout(() => {
        fetchClubs();
      }, 500);
  
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
    };
  
    initializeMap();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = async (e: mapboxgl.MapMouseEvent) => {
      if (!placementMode || queue.length === 0) {
        return;
      }
      
      const { lng, lat } = e.lngLat;
      new mapboxgl.Marker() 
        .setLngLat([lng, lat])
        .addTo(mapRef.current!);

      await handlePlaceClub(lng, lat);
    };

  mapRef.current.on("click", handleMapClick);

  // Cleanup: remove the event listener when dependencies change
  return () => {
    if (mapRef.current) {
      mapRef.current.off("click", handleMapClick);
    }
  };
  }, [queue, placementMode]);

  // Assign coordinates to the next club in the queue
  const handlePlaceClub = async (lng: number, lat: number) => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue; // No clubs left to place; means markers with no associated club could be place but not saved
  
      const nextClub = prevQueue[0];
  
      // Send update request
      fetch('/api/updateClub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateCoordinates',
          id: nextClub.id,
          x: lng,
          y: lat,
        })
      }).then((response) => {
        if (response.ok) {
          // Update the club in the main clubs array
          setClubs((prevClubs) =>
            prevClubs.map((club) =>
              club.id === nextClub.id ? { ...nextClub, x: lng, y: lat } : club
            )
          );
        } else {
          console.error('Failed to update club coordinates');
        }
      }).catch((error) => {
        console.error('Error updating club:', error);
      });
  
      // Remove the first club from the queue and return the updated state
      return prevQueue.slice(1);
    });
  };

  const handleAddTable = () => {
    router.push(`/addTable/${id}`)
  }

  const handleSave = async () => {
    // setIsLoading(true);
    setStatus('');

    try {
      const response = await fetch('/api/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: parseInt(id, 10) }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setStatus(data.message);
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setStatus(error.message);
      } else {
        setStatus('Error sending invitations. Please check the console for details.');
      }
    }
  };

  const handleSubmit = async () => {
    await handleSave();
    handleClose();
  };

  const handleClose = () => {
    router.push(`/eventview?id=${id}`);
  };

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

  // Edit club information
  const handleEditClub = async () => {
    router.push(`/editTable/${clubInfo?.id}`); // Navigate to edit page with club ID
  };

  // Move club marker
  const handleMoveClub = async () => {
    
    if (!clubInfo || !mapRef.current) return;

    // Remove coordinates in backend
    try {
      const response = await fetch('/api/updateClub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'removeCoordinates',
          id: clubInfo.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove club coordinates');
      }

      // Update the club in the local state
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === clubInfo.id
            ? { ...club, x: undefined, y: undefined, coordinates: undefined }
            : club
        )
      );

      // Add to front of queue
      setQueue((prevQueue) => [clubInfo, ...prevQueue]);

      // Close the popup
      setShowClubInfo(false);

      // Trigger rerender (optional: you could remove and reload markers if you store them)
      mapRef.current?.fire('load');

      console.log(`Club ${clubInfo.name} moved back to queue.`);
    } catch (error) {
      console.error('Error moving club:', error);
    }

  };

  return (
    <div className="wrapper">
      <div ref={mapContainerRef} className="mapContainer"/>
      {showClubInfo && clubInfo !== undefined && 
      <InfoPopup 
        club={clubInfo} 
        onClose={() => setShowClubInfo(false)} 
        onEdit={handleEditClub}
        onMove={handleMoveClub}
      />}
      <div className="p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-4 flex items-center">
          Unplaced Clubs
          <span className="ml-2 text-blue-500">(Editing Placement)</span>
        </h1>

        {/* Category Dropdown */}
        <div className="mb-4 w-3/5 bg-categoryBg">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-3 border rounded bg-categoryBg"
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
        <div className="flex flex-row overflow-auto items-center gap-[1vw]">
          {/* Queue container (conditionally hidden when empty) */}
          {queue.length > 0 && (
            <div className="flex-grow min-w-0">
              <ul className="flex flex-row overflow-x-auto no-scrollbar">
                {queue.map((club) => (
                  <li key={club.id} className="p-4 mr-2 border-b bg-categoryBg min-w-[8vw] h-[6vh] truncate text-center">
                    {club.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit button (moves left when queue is empty) */}
          <div className={`queueAndSubmit flex-shrink-0 ${queue.length > 0 ? 'ml-4' : ''}`}>
            <button className="h-[6vh] px-6 mr-2 border border-[#2E73B5] bg-[#F7F9FB] text-[#2E73B5]" onClick={handleAddTable}>
              + Table
            </button>
            <button
              type="button"
              className="h-[6vh] px-6 mr-2 border border-[#2E73B5] bg-white text-[#2E73B5]"
              onClick={handleSave}
            >
              Save
            </button>
            <button type="submit" className="h-[6vh] px-6 bg-[#2E73B5] text-white" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
      {status && (
        <p className={`mt-4 text-center ${
          status.includes('Error') ? 'text-red-600' : 'text-green-600'
        }`}>
          {status}
        </p>
      )}
    </div>
  );
};
