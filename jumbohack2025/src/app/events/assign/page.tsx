'use client';

import { useEffect, useState } from 'react';

export default function AssignClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [queue, setQueue] = useState<any[]>([]);
  const [currentClub, setCurrentClub] = useState<any>(null);

  // Fetch clubs on page load
  useEffect(() => {
    const fetchClubs = async () => {
      const response = await fetch('/api/getClubs');
      const data = await response.json();
      setClubs(data);

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((club: any) => club.category))];
      setCategories(uniqueCategories);
    };

    fetchClubs();
  }, []);

  // Update queue when category is selected
  useEffect(() => {
    if (selectedCategory) {
      const filteredClubs = clubs.filter((club) => club.category === selectedCategory);
      setQueue(filteredClubs);
    }
  }, [selectedCategory, clubs]);

  // Assign coordinates to the next club in the queue
  const handlePlaceClub = async () => {
    if (queue.length === 0) return;

    const nextClub = queue[0];

    // Skip if the club already has coordinates
    if (nextClub.coordinates) {
      setQueue((prevQueue) => prevQueue.slice(1));
      return;
    }

    // Assign coordinates (1, 1)
    const updatedClub = { ...nextClub, coordinates: { x: 1, y: 1 } };

    // Update the database
    const response = await fetch('/api/updateClub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: updatedClub.id,
        coordinates: updatedClub.coordinates,
      }),
    });

    if (response.ok) {
      // Update the queue and current club
      setQueue((prevQueue) => prevQueue.slice(1));
      setCurrentClub(updatedClub);
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
              {club.name} - {club.coordinates ? `(${club.coordinates.x}, ${club.coordinates.y})` : 'Unassigned'}
            </li>
          ))}
        </ul>
      </div>

      {/* Place Club Button */}
      <button
        onClick={handlePlaceClub}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={queue.length === 0}
      >
        Place Club
      </button>

      {/* Current Club */}
      {currentClub && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Last Placed Club</h2>
          <p>
            {currentClub.name} - ({currentClub.coordinates.x}, {currentClub.coordinates.y})
          </p>
        </div>
      )}
    </div>
  );
}