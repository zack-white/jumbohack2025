"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Event {
  name: string;
  date: string;
  start_time?: string;
  description?: string;
  id: number
}

const fetchEvents = async (): Promise<Event[]> => {
  try {
    console.log("Fetching events...");
    const response = await fetch("/api/getEventsByDate");
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched events:", data);
    
    // Validate the data structure
    if (Array.isArray(data)) {
      return data;
    } else {
      console.error("API did not return an array:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export default function UpcomingEvents() {
  const [showAllEvents, setShowAllEvents] = useState(false);
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const router = useRouter();
  
  const handleEvent = (event: Event) => {
    router.push(`/eventview?id=${event.id}`);
  };
  
  const calculateDays = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format event date
  const formatEventDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM do");
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateStr);
      return "Invalid date";
    }
  };
  
  // Format time from 24h to 12h format
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Convert to 12-hour format
      const period = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
      
      // Format as "h:MM AM/PM"
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error("Time formatting error:", error, "for time:", timeStr);
      return timeStr;
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary md:text-3xl font-serif">
            Upcoming Events
          </h2>
        </div>
        <div className="animate-pulse space-y-4 md:grid md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 shadow-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-primary mb-4 md:text-3xl font-serif">
          Upcoming Events
        </h2>
        <p className="text-red-500 font-inter">Failed to load events. Please try again later.</p>
      </div>
    );
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Separate upcoming and past events
  const currentDate = new Date();
  const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= currentDate);
  const pastEvents = sortedEvents.filter(event => new Date(event.date) < currentDate);

  // Display only 3 events when showAllEvents is false
  const displayedUpcomingEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 3);
  
  const displayEvents = showAllEvents 
    ? [...displayedUpcomingEvents, ...pastEvents] 
    : displayedUpcomingEvents;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-primary md:text-3xl font-serif">
          Upcoming Events
        </h2>
        <button 
          onClick={() => setShowAllEvents(!showAllEvents)} 
          className="text-blue-600 hover:underline font-medium"
        >
          {showAllEvents ? "Show Less" : "See All Events"}
        </button>
      </div>

      {/* Show message if no events */}
      {displayEvents.length === 0 && (
        <p className="text-gray-600 font-inter">No upcoming events found.</p>
      )}

      {/* MOBILE Layout */}
      <div className="md:hidden space-y-4">
        {displayEvents.map((event) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;
          const isPast = daysUntil < 0;

          return (
            <div 
              key={event.id || event.name} 
              className={`bg-categoryBg shadow-sm p-4 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${isPast ? 'opacity-70' : ''}`}
              onClick={() => handleEvent(event)}
            >
              {/* First row: Name and Days Until */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-primary font-inter">{event.name}</h3>
                <div className="text-sm font-bold text-gray-600 font-inter">
                  {isToday ? "Today" : isPast ? "Past" : `${daysUntil} days`}
                </div>
              </div>
              
              {/* Second row: Date and Time */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-inter">
                  {formatEventDate(event.date)}
                </p>
                {event.start_time && (
                  <p className="text-sm text-gray-600 font-inter">
                    {formatTime(event.start_time)}
                  </p>
                )}
              </div>
              
              {/* Third row: Description */}
              {event.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP Layout - updated to match Figma design */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6">
        {displayEvents.map((event) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;
          const isPast = daysUntil < 0;

          return (
            <div
              key={event.id || event.name}
              className={`bg-categoryBg p-6 border border-gray-200 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${isPast ? 'opacity-70' : ''}`}
              onClick={() => handleEvent(event)}
            >
              {/* First row: Name and Days Until */}
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-primary">
                  {event.name}
                </h3>
                <span className="text-sm font-bold text-gray-600">
                  {isToday ? "Today" : isPast ? "Past" : `${daysUntil} days`}
                </span>
              </div>
              
              {/* Second row: Date and Time */}
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">
                  {formatEventDate(event.date)}
                </p>
                {event.start_time && (
                  <p className="text-sm text-gray-600">
                    {formatTime(event.start_time)}
                  </p>
                )}
              </div>
              
              {/* Third row: Description */}
              {event.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {event.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}