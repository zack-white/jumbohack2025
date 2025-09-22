'use client';
import { useEffect, useState } from 'react';
import ClubsSearch from "../../components/ClubsSearch";
import ShowMapButton from '../../components/showMapButton';
import ContactInfoCard from '@/components/ContactInfoCard';
// import Tooltip from '@/components/tooltip';
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useTheme } from "next-themes";

interface Event {
  address: string;
  city: string;
  email: string;
  end_time: string;
  start_time: string;
  firstname: string;
  lastname: string;
  location: object;
  organizationname: string;
  phonenumber: string;
  scale: string;
  state: string;
  timedtables: boolean;
  zipcode: string;
  id: number;
  name: string;
  description: string;
  date: string;
  creator: string;
}

export default function EventPage() {
  const { user } = useUser();
  const router = useRouter();
  const userEmail = user?.emailAddresses[0]?.emailAddress || ""; // Ensure it's always a string 100p this is chat code
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
  }, [id]); 

  const handleEdit = () => {
    router.push(`/placement/${id}`);
  };

  const formatTime = (time: string): string => {
    const [hourStr, minuteStr] = time.split(':')
    let hour = parseInt(hourStr, 10)
    const period = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${hour}:${minuteStr} ${period}`
  }

  if (loading) return <p>Loading event...</p>;
  if (!event) return <p>No event found</p>;

  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "long" });
  const month = eventDate.toLocaleDateString("en-US", { month: "long" });
  const day = eventDate.getDate();

  console.log(event)

  return (
    <>
      <div className="bg-white md:overflow-hidden max-w-7xl mx-auto py-6 px-6 flex flex-col items-center justify-center">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 sm:max-h-[60vh] max-h-[100vh] justify-between w-full">
          <div className="md:flex-1 md:min-w-0">
            <h1 className="px-4 text-2xl md:text-3xl font-bold font-serif">{event.name}</h1>
            <p className="px-4 text-gray-500">
                {dayName}, {month} {day} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
            </p>
            <ShowMapButton eventID={id} />

            <div className='flex flex-row justify-between pb-2'>
              <h1 className="text-xl md:text-2xl font-bold font-serif mb-1 px-4">About this Event</h1>
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
            <div className="mt-4 pl-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold font-serif">Contact Information</h1>
              </div>
              <ContactInfoCard
                isEventOrganizer={true}
                organizer={event.organizationname} 
                address={event.address} 
                phoneNumber={event.phonenumber} 
                city={event.city} 
                state={event.state} 
                zipCode={event.zipcode} 
                email={event.email} 
              />
            </div>
          </div>
          <div className='overflow-hidden md:basis-[40%] md:min-w-[40%] md:shrink-0'>
            <ClubsSearch eventId={id} />
          </div>
        </div>
      </div>
      <div className="bg-[#2971AC] w-[100vw] mt-10">
        <div className="flex flex-col max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 gap-4">
          <Image
            src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'}
            alt="JumboMap Logo"
            width={140}
            height={40}
            className="h-8 w-auto md:h-12 md:w-auto self-start px-4"
          />
          <div className='flex flex-col items-center md:flex-row justify-center gap-6 mt-4 px-4'>
            <div className='w-full md:w-1/2'>
              <ContactInfoCard
                isEventOrganizer={false}
                organizer={"TUPD"} 
                address={"419 Boston Ave"} 
                phoneNumber={"(617) 627-6911"} 
                city={"Medford"} 
                state={"MA"} 
                zipCode={"02155"} 
                email={""} 
              />
            </div>
            <div className='w-full md:w-1/2'>
              <ContactInfoCard
                isEventOrganizer={false}
                organizer={"Tufts Health Services"} 
                address={"124 Professors Row"} 
                phoneNumber={"(617) 627 3350"} 
                city={"Medford"} 
                state={"MA"} 
                zipCode={"02155"} 
                email={""} 
              />
            </div>
          </div>
          <div className='flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6 px-4'>
            <p className='text-white text-xs'>© 2025 Created by Dan Glorioso, William Goldman, Hannah Jiang, Holden Kittelberger, Shayne Sidman, Elisa Yu, Zachary White</p>
            <div className='flex flex-row gap-6'>  
              <a className='flex justify-center items-center text-center px-6 py-2 text-white text-sm border border-white hover:cursor-pointer'>
                Report a Bug
              </a>
              <div 
                className='flex flex-row gap-1 items-center px-6 py-2 bg-white text-sm text-[#2971AC] hover:cursor-pointer'
              >
                <p className='text-center'>Back to Top</p>
                <Image src={"/back-to-top.svg"} alt={"Back to top"} width={16} height={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
