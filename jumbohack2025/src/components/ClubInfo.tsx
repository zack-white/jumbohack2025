"use client";

import React from "react";
import { motion } from "framer-motion";

// Define the Club interface
interface Club {
  id: number;
  name: string;
  description: string;
}

interface InfoPopupProps {
  club: Club;
  onClose: () => void;
}

export default function InfoPopup({ club, onClose }: InfoPopupProps) {
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
      <p className="text-gray-600">{club.description}</p>
      </motion.div>
    </div>
  );
}
