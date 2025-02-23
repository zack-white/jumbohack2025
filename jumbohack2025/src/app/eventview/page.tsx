'use client';
import { useEffect, useState } from 'react';
import ClubsSearch from "../../components/ClubsSearch"
import ShowMapButton from '../../components/showMapButton';
import { useSearchParams } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';



interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  creator: string;
  duration: string;
  start_time: string;
}

export default function EventPage({ eventId }: { eventId: number }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const userEmail = user?.emailAddresses[0]?.emailAddress; 
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));


  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/fetchEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id }),
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

  async function handleEdit() {
    console.log(id);
    router.push(`/placement/${id}`);
  }

  if (loading) return <p>Loading event...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!event) return <p>No event found</p>;

  const eventDate = new Date(event.date);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayName = days[eventDate.getDay()];
  const month = months[eventDate.getMonth()];
  const day = eventDate.getDate();
  const start_time = event.start_time;


  return (
    <div className="max-h-screen bg-white overflow-hidden">
        <div className="mx-auto w-full py-6 px-[10vw] flex flex-col md:flex-row space-y-4 md:space-y-0">
            <div className='md:w-1/2'>
                <h1 className="text-2xl md:text-3xl font-bold font-serif">{event.name}</h1>
                <p className="text-gray-500">
                    {dayName}, {month} {day} ∙ {start_time}
                </p>
                <ShowMapButton eventID={id} />

                <h1 className="text-2xl md:text-3xl font-bold font-serif mb-1">Event Description</h1>
                <p className="text-gray-500">{event.description}</p>
            </div>
            <div className='md:w-1/2'>
                {/* Show Edit Button if the logged-in user is the creator */}
                {userEmail === event.creator && (
                    <div className="mt-4 flex justify-center">
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => {handleEdit()}}
                    >
                        Edit Event
                    </button>
                    </div> )}
                <ClubsSearch eventId={id}/>
                </div>
            </div>
        </div>
  );
}