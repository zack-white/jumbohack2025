"use client";

import { useSearchParams } from "next/navigation"; 
import { useEffect, useState } from "react";
import ClubsSearch from "../components/ClubsSearch";
import ShowMapButton from "../components/showMapButton";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
}

export default function EventPage() {
  const searchParams = useSearchParams();
  const eventId = Number(searchParams.get("id")) || 0; 
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!eventId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/fetchEvent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: eventId }),
        });

        const data = await res.json();

        if (res.ok) {
          setEvent(Array.isArray(data) ? data[0] : data);
        } else {
          setError(data.error || "Failed to fetch event");
        }
      } catch (error) {
        setError("Failed to fetch event");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  const eventDate = new Date(event.date);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayName = days[eventDate.getDay()];
  const month = months[eventDate.getMonth()];
  const day = eventDate.getDate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{event.name}</h1>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-gray-500">
        {dayName}, {month} {day}
      </p>
      <ShowMapButton />
      <ClubsSearch eventId={eventId} />
    </div>
  );
}
