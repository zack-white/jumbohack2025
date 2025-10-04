"use client";

import { useState } from "react";

interface Club {
  id: number;
  name: string;
  description: string;
}

interface SendInvitationsProps {
  club: Club; // Explicitly define that it expects a `club` prop
}

export default function SendInvitations({ club }: SendInvitationsProps) { 
  const eventId = club.id;
  // console.log("eventId:", eventId);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/send-invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
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

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
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
