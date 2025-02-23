'use client';
import { useEffect, useState } from 'react';

export default function EventPage({ eventId }: { eventId: number }) {
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch('/api/fetchEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 1 }),
        });

        const data = await res.json();
        console.log(data);
        if (res.ok) setEvent(data);
        else console.error('Error:', data.error);
      } catch (error) {
        console.error('Fetch failed:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId]);

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>Event not found</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">{event.name}</h1>
      <p className="text-gray-600">{event.description}</p>
      <p className="text-gray-500">{event.date}</p>
    </div>
  );
}
