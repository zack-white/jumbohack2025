"use client";

import React from "react";
import { motion } from "framer-motion";

// Define the Club interface
interface Club {
  id: number;
  name: string;
  description: string;
  start_time: string;
  end_time: string;
}

interface InfoPopupProps {
  club: Club;
  onClose: () => void;
}

export default function InfoPopup({ club, onClose }: InfoPopupProps) {
  // Helper function to format time (e.g., "14:30:00" -> "2:30 PM")
  const formatTime = (timeString: string) => {
    if (!timeString) return "Not specified";
    
    try {
      // If it's already in a good format, return as is
      if (timeString.includes("AM") || timeString.includes("PM")) {
        return timeString;
      }
      
      // Convert "HH:MM:SS" or "HH:MM" to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      // If parsing fails, return the original string
      return timeString;
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-black/50"
      onClick={onClose} // Close when clicking outside
    >
      <motion.div
      initial={{ y: "100%", opacity: 0 }} // Start off-screen
      animate={{ y: 0, opacity: 1 }} // Slide up when opening
      exit={{ y: "100%", opacity: 0 }} // Slide down when closing
      transition={{ type: "duration: 0.2", stiffness: 100, damping: 15 }}
      className="bg-white w-full max-w-md p-4 pb-8 rounded-t-lg shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
      {/* Close Button */}
      <button
        className="absolute top-2 right-4 text-gray-500"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Club Info */}
      <h2 className="text-lg font-bold">{club.name}</h2>
      <p className="text-gray-600 mb-3">{club.description}</p>
      
      {/* Timing Information */}
      <div className="border-t pt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Event Times</h3>
        <div className="space-y-1">
          <div className="flex gap-4 text-sm text-gray-700">
            <p>
              <span className="font-medium">Start:</span> {formatTime(club.start_time)}
            </p>
            <p>
              <span className="font-medium">End:</span> {formatTime(club.end_time)}
            </p>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}
