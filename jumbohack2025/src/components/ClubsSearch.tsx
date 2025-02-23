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
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    }

    fetchClubs();
  }, [eventId]); // Re-run when eventId changes

  function handlePopup(club: Club) {
    setSelectedClub(club);
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="mb-4 text-lg font-bold">Who’s Attending?</h2>

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
        {selectedClub && (
          <InfoPopup club={selectedClub} onClose={() => setSelectedClub(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
