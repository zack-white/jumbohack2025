'use client';

import { useState, useEffect } from 'react';
import FullScreenMap from '../../map/map';

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
      // console.log('Entered ID:', eventId);

      try {
        const response = await fetch(`/api/getEventInfo?eventId=${eventId}`, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch event info');
        }

        const result = await response.json();
        const { x, y } = result.location;

        // Update state
        setMapData({ long: x, lat: y, scale: result.scale });
      } catch (error) {
        console.error('Error fetching event info:', error);
        alert('Error fetching event info. Please try again.');
      }
    }

    fetchEventInfo();
  }, []);

  // Handle location selection
  const handleLocationSelect = (coordinates: { x: number; y: number }, zoom: number) => {
    // console.log('Selected Location:', coordinates, 'Zoom:', zoom);
    setMapData({ long: coordinates.x, lat: coordinates.y, scale: zoom });
  };

  if (!mapData) {
    return <div>Loading...</div>;
  }

  return (
    <FullScreenMap 
      long={mapData.long} 
      lat={mapData.lat} 
      scale={mapData.scale} 
      onLocationSelect={handleLocationSelect}
    />
  );
}
