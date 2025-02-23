"use client";

import { useEffect, useState } from "react";

interface Club {
  id: number;
  name: string;
  description: string;
}

export default function SendInvitations() { 
  const [club, setClub] = useState<Club | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchClub() {
      try {
        const response = await fetch("/api/get-club"); // Adjust API route
        const data: Club = await response.json();
        setClub(data);
      } catch (error) {
        console.error("Error fetching club:", error);
      }
    }

    fetchClub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/send-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: club.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setStatus(data.message);
    } catch (error) {
      console.error("Error:", error);
      setStatus(
        (error as Error).message ||
          "Error sending invitations. Please check the console for details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!club) return <p>Loading club details...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-lg font-bold mb-2">{club.name}</h2>
      <p className="text-gray-600">{club.description}</p>
      
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleSubmit}
      >
        {isLoading ? "Sending..." : "Send Invitations"}
      </button>

      {status && (
        <p
          className={`mt-4 text-center ${
            status.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
