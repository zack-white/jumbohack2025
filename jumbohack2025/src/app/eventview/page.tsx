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
    router.push('/placement');
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
                <ShowMapButton />

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


// {/* <main className="min-h-screen bg-white">
//         {/* Outer container (mobile defaults, desktop overrides) */}
//         <div className="mx-auto w-full py-6">
//           <div className="px-[10vw]">
//             {/* Top heading (mobile = text-2xl, desktop = text-3xl or 4xl) */}
//             <div>
//               <h1 className="text-2xl text-gray-900 mb-6 md:text-3xl font-serif font-bold pt-2 text-primary">
//                 Welcome to JumboMap
//               </h1>
//             </div>

//             {/* Team Image & Overlay */}
//             <div className="relative mb-8 flex justify-center">
//               <div className="relative w-full md:h-[50vh]">
//                 <Image
//                   src="/images/JumboMap_Group.jpeg"
//                   alt="Team photo"
//                   width={800}
//                   height={400}
//                   className="w-full h-full object-cover object-center md:object-[45%_25%]"
//                   priority
//                 />
//                 <div className="absolute inset-0 bg-black/30" />
//               </div>
            

                
//                 {/* Text overlay */}
//                 <div className="absolute bottom-8 right-8 bg-white p-2 md:max-w-[30vw] md:bg-transparent md:bottom-1/2 md:left-0 md:p-0 md:transform md:translate-y-3/4">
//                   <h2 className="text-2xl font-medium pl-2 md:p-10 md:text-3xl md:bg-white text-primary font-serif">
//                     Making events more accessible for students
//                   </h2>
//                 </div>
//               </div>

//             {/* Upcoming Events (already has its own mobile vs desktop layout) */}
//             <UpcomingEvents />
//           </div>

//           {/* CTA Section */}
//           <div className="bg-[#2E73B5] text-white mt-12 py-24 px-6 w-full">
//             <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-24">
//               <h2 className="text-2xl text-center md:text-left md:text-3xl font-bold">
//                 Let&apos;s get your event started
//               </h2>
//               <Link
//                 href="/events/create"
//                 className="bg-white text-[#2E73B5] px-12 py-3 hover:bg-gray-100 transition-colors text-center md:text-xl font-inter"
//               >
//                 Create New Event
//               </Link>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="px-4 md:px-[10vw]">
//             <footer className="mt-4 py-8 text-center md:mt-8 md:py-4">
//               <Image
//                 src={
//                   theme === "dark"
//                     ? "/logo-footer-light.svg"
//                     : "/logo-footer-dark.svg"
//                 }
//                 alt="JumboMap Logo"
//                 width={80}
//                 height={80}
//                 className="mx-auto mb-4"
//               />
//               <p className="text-sm md:text-lg text-gray-600 max-w-2xl md:max-w-4xl mx-auto font-inter py-2">
//                 This project was developed during JumboHack 2025 to create an
//                 innovative solution that helps students easily navigate current
//                 campus events, explore event layouts, and discover clubs more efficiently.
//                 We hope you enjoy!
//               </p>
//               <p className="text-xs md:text-base text-gray-500 mt-4 font-inter">
//                 © 2025 Elisa Yu, Hannah Jiang, Holden Kittelberger, Shayne Sidman,
//                 William Goldman, Zachary White
//               </p>
//             </footer>
//           </div>
//         </div>
//       </main> */}