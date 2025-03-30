'use client';
import { useEffect, useState } from 'react';
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
    <div className="md:h-[calc(100vh-5rem)] bg-white md:overflow-hidden p-4 mx-auto w-full py-6 px-[10vw] flex flex-col md:flex-row space-y-4 md:space-y-0">
        <div className='md:w-1/2 p-4'>
            <h1 className="px-4 text-2xl md:text-3xl font-bold font-serif">{event.name}</h1>
            <p className="px-4 text-gray-500">
                {dayName}, {month} {day}
            </p>
            <ShowMapButton eventID={id} />

            <div className='flex flex-row justify-between pb-2'>
                <h1 className="text-xl md:text-2xl font-bold font-serif mb-1 px-4">Event Description</h1>
                {/* Show Edit Button if the logged-in user is the creator */}
                {userEmail === event.creator && (
                    <div className="flex justify-center">
                        <button
                            className="bg-[#2971AC] text-white px-4 py-2 font-inter md:text-base text-xs font-medium"
                            onClick={handleEdit}
                        >
                            Edit Event
                        </button>
                    </div>
                )}
            </div>
            <p className="px-4 text-gray-500">{event.description}</p>
        </div>

        <div className='md:w-1/2'>
            <ClubsSearch eventId={id} />
        </div>
    </div>
  );
}
