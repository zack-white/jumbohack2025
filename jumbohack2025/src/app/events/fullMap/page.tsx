'use client';

import { useState, useEffect } from 'react';
import FullScreenMap from '../../map/fullScreenMap';

interface MapData {
  long: number;
  lat: number;
  scale: number;
}

export default function FullScreen() {
  const [mapData, setMapData] = useState<MapData | null>(null);

  useEffect(() => {
    async function fetchEventInfo() {
      const eventId = window.prompt("Enter an eventID: ");
      console.log('Entered ID:', eventId);

      try {
        const response = await fetch(`/api/getEventInfo?eventId=${eventId}`, {
          method: 'GET'
        });
        console.log('Response from backend:', response);

        if (!response.ok) {
          throw new Error('Failed to fetch event info');
        }

        const result = await response.json();
        const { x, y } = result.location;
        console.log('Fetched values:', { long: x, lat: y, scale: result.scale });

        // Set the new map data
        setMapData({ long: x, lat: y, scale: result.scale });
      } catch (error) {
        console.error('Error fetching event info:', error);
        alert('Error fetching event info. Please try again.');
      }
    }

    fetchEventInfo();
  }, []);

  // Render a loading state until the map data is fetched
  if (!mapData) {
    return <div>Loading...</div>;
  }

  return (
    <FullScreenMap 
      long={mapData.long} 
      lat={mapData.lat} 
      scale={mapData.scale} 
    />
  );
}
