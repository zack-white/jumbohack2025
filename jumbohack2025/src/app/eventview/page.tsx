'use client';
import { useEffect, useState } from 'react';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
}

export default function EventPage({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/fetchEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 1 }),
        });

        const data = await res.json();

        if (res.ok) {
          setEvent(Array.isArray(data) ? data[0] : data);
        } else {
          setError(data.error || 'Failed to fetch event');
        }
      } catch (error) {
        setError('Failed to fetch event');
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  // Convert date
  const eventDate = new Date(event.date);
  
  // Format Date
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayName = days[eventDate.getDay()]; // Full weekday name
  const month = months[eventDate.getMonth()]; // Full month name
  const day = eventDate.getDate(); // Numeric day

  console.log("Raw Date:", event.date);
  console.log("Parsed Date:", eventDate);
  console.log("Day of Week:", dayName);
  console.log("Month:", month);
  console.log("Day:", day);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{event.name}</h1>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-gray-500">
        {dayName}, {month} {day}
      </p>
    </div>
  );
}
