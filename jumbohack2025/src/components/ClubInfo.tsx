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
  onEdit: () => void;
  onMove: (() => void) | null;
}

export default function InfoPopup({ club, onClose, onEdit, onMove }: InfoPopupProps) {
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
      className="bg-white w-full max-w-xl p-4 pb-8 rounded-t-lg shadow-lg relative"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">{club.name}</h1>
        <div className="flex space-x-4">
          {onMove && (
            <button className="h-[6vh] px-6 bg-[#2E73B5] text-white" onClick={onMove}>
              Move
            </button>
          )}
          <button className="h-[6vh] px-6 border border-[#2E73B5] bg-[#F7F9FB] text-[#2E73B5]" onClick={onEdit}>
        Edit
          </button>
          <button className="text-3xl text-gray-500" onClick={onClose}>
        ✕
          </button>
        </div>
      </div>
      <p className="text-gray-600">{club.description}</p>
      </motion.div>
    </div>
  );
}
