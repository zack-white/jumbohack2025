"use client";

import React, { useState, useEffect } from 'react';
import InfoPopup from './ClubInfo';
import { AnimatePresence } from "framer-motion";

interface Club {
  id: number;
  name: string;
  description: string;
}

export default function ClubsSearch({ eventId }: { eventId: number }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchClubs = async () => {
        try {
          const response = await fetch(`/api/searchClubs?q=${encodeURIComponent(search)}`);
          if (!response.ok) {
            throw new Error(`Network response was not ok (status: ${response.status})`);
          }
          const data: Club[] = await response.json();
          console.log(data);
          setClubs(data);
        } catch (error) {
          console.error('Error fetching clubs:', error);
        }
      };
      fetchClubs();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  function handlePopup(club: Club) {
    setSelectedClub(club);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="mb-4 text-lg font-bold">Who’s Attending?</h2>
      
      {/* Search Bar */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search attending clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
      </div>
      
      {/* Clubs List */}
      <div>
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-gray-200 p-3 rounded cursor-pointer mb-2 shadow"
            onClick={() => handlePopup(club)}
          >
            {club.name}
          </div>
        ))}
      </div>

      {/* InfoPopup with slide-up animation */}
      <AnimatePresence>
        {selectedClub && <InfoPopup club={selectedClub} onClose={() => setSelectedClub(null)} />}
      </AnimatePresence>
    </div>
  );
};
