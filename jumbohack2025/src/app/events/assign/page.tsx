'use client';
import { useEffect, useState } from 'react';

export default function AssignClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [queue, setQueue] = useState<any[]>([]);
  const [currentClub, setCurrentClub] = useState<any>(null);

  async function fetchClubs() {
    const response = await fetch('/api/getClubs');
    const data = await response.json();
    setClubs(data);
    // Extract unique categories
    const uniqueCategories = [...new Set(data.map((club: any) => club.category))];
    setCategories(uniqueCategories);
  };

  // Fetch clubs on page load
  useEffect(() => {
    fetchClubs();
  }, []);

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

  // Assign coordinates to the next club in the queue
  const handlePlaceClub = async () => {
    if (queue.length === 0) return;
    const nextClub = queue[0];
    
    try {
      const response = await fetch('/api/updateClub', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: nextClub.id,
          x: 1,
          y: 1,
        })
      });

      if (response.ok) {
        // Update the local state
        const updatedClub = { ...nextClub, x: 1, y: 1 };
        
        // Remove the club from the queue
        setQueue((prevQueue) => prevQueue.slice(1));
        
        // Set the current club
        setCurrentClub(updatedClub);
        
        // Update the club in the main clubs array
        setClubs((prevClubs) =>
          prevClubs.map((club) =>
            club.id === updatedClub.id ? updatedClub : club
          )
        );
      } else {
        console.error('Failed to update club coordinates');
      }
    } catch (error) {
      console.error('Error updating club:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assign Clubs to Coordinates</h1>
      
      {/* Category Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border rounded"
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
        <h2 className="text-xl font-bold">Queue</h2>
        <ul>
          {queue.map((club) => (
            <li key={club.id} className="p-2 border-b">
              {club.name} - {club.coordinates}
            </li>
          ))}
        </ul>
      </div>

      {/* Place Club Button */}
      <button
        onClick={handlePlaceClub}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        disabled={queue.length === 0}
      >
        Place Club
      </button>

      {/* Current Club */}
      {currentClub && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Last Placed Club</h2>
          <p>
            {currentClub.name} - ({currentClub.x}, {currentClub.y})
          </p>
        </div>
      )}
    </div>
  );
}