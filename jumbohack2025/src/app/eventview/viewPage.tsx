"use client";

import { useSearchParams } from "next/navigation"; 
import { useEffect, useState } from "react";
import ClubsSearch from "@/components/ClubsSearch";
import ShowMapButton from "@/components/showMapButton";

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
          throw new Error(data.error || "Failed to fetch event");
        }
      } catch (err) {
        setError((err as Error).message); 
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>; 

  if (!event) return <p className="text-gray-500">No event found</p>;

  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "long" });
  const month = eventDate.toLocaleDateString("en-US", { month: "long" });
  const day = eventDate.getDate();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{event.name}</h1>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-gray-500">
        {dayName}, {month} {day}
      </p>
      <ShowMapButton eventID={eventId} />
      <ClubsSearch eventId={eventId} />
    </div>
  );
}
