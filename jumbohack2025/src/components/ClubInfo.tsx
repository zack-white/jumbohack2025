"use client";

import React from "react";
import { motion } from "framer-motion";

// Data shapes
interface Club {
  id: number;
  name: string;
  description: string;
  start_time?: string;
  end_time?: string;
}

interface InfoPopupProps {
  club: Club;
  onClose: () => void;
  onEdit: (() => void) | null;
  onMove: (() => void) | null;
}

export default function InfoPopup({ club, onClose, onEdit, onMove }: InfoPopupProps) {
  // "14:30:00" -> "2:30 PM"
  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not specified";
    try {
      if (timeString.includes("AM") || timeString.includes("PM")) return timeString;
      const [hh, mm] = timeString.split(":");
      const h24 = parseInt(hh, 10);
      const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
      const ampm = h24 >= 12 ? "PM" : "AM";
      return `${h12}:${mm} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
        className="bg-white w-full max-w-xl p-4 pb-8 rounded-t-lg shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <div className="flex space-x-4">
            {onMove && (
              <button className="h-[6vh] px-6 bg-[#2E73B5] text-white" onClick={onMove}>
                Move
              </button>
            )}
            {onEdit && (
              <button className="h-[6vh] px-6 border border-[#2E73B5] bg-[#F7F9FB] text-[#2E73B5]" onClick={onEdit}>
                Edit
              </button>
            )}
            <button className="text-3xl text-gray-500" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-3">{club.description}</p>

        {/* Timing Information */}
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Event Times</h3>
          <div className="flex gap-4 text-sm text-gray-700">
            <p>
              <span className="font-medium">Start:</span> {formatTime(club.start_time)}
            </p>
            <p>
              <span className="font-medium">End:</span> {formatTime(club.end_time)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
