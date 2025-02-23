"use client";

import React, { useState, useEffect } from "react";
import InfoPopup from "./ClubInfo";
import { AnimatePresence } from "framer-motion";

interface Club {
  id: number;
  name: string;
  description: string;
}

export default function ClubsSearch({ eventId }: { eventId: number }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchClubs() {
      try {
        console.log(eventId);
        const response = await fetch("/api/holdenRoute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }), // Send eventId only
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok (status: ${response.status})`);
        }

        const data: Club[] = await response.json();
        setClubs(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    }

    fetchClubs();
  }, [eventId]); // Re-run when eventId changes

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );

  function handlePopup(club: Club) {
    setSelectedClub(club);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="mb-4 text-lg font-bold">Who’s Attending?</h2>
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search attending clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="button"
          style={{
            marginLeft: '8px',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: '#f3f3f3',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {/* Simple magnifying glass icon (inline SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.867-3.867zM12.5 6.5a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>
      </div>
      {/* Clubs List */}
      <div>
        {filteredClubs.map((club) => (
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
        {selectedClub && (
          <InfoPopup club={selectedClub} onClose={() => setSelectedClub(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
