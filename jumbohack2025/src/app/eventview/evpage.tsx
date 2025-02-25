'use client';
import { Suspense, useEffect, useState } from 'react';
import ClubsSearch from "../../components/ClubsSearch";
import ShowMapButton from '../../components/showMapButton';
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  creator: string;
}

export default function EventPage() {
  const { user } = useUser();
  const router = useRouter();
  const userEmail = user?.emailAddresses[0]?.emailAddress || ""; // Ensure it's always a string
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch('/api/fetchEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();
        if (res.ok) {
          setEvent(Array.isArray(data) ? data[0] : data);
        } else {
          console.error("Error fetching event:", data.error);
        }
      } catch (err) {
        console.error('Failed to fetch event', err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchEvent();
  }, [id]); // ✅ Added `id` to dependency array

  const handleEdit = () => {
    router.push(`/placement/${id}`);
  };

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>No event found</p>;

  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "long" });
  const month = eventDate.toLocaleDateString("en-US", { month: "long" });
  const day = eventDate.getDate();

  return (
    <Suspense fallback={<p>loading event...</p>}>
      <div className="p-4">
        <h1 className="text-xl font-bold">{event.name}</h1>
        <p className="text-gray-600">{event.description}</p>
        <p className="text-gray-500">
          {dayName}, {month} {day}
        </p>
        <ShowMapButton eventID={id} />

        {/* Show Edit Button if the logged-in user is the creator */}
        {userEmail === event.creator && (
          <div className="mt-4 flex justify-center">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleEdit}
            >
              Edit Event
            </button>
          </div>
        )}
        <ClubsSearch eventId={id} />
      </div>
    </Suspense>
  );
}
