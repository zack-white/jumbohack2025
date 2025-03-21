"use client";

import React from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Event {
  name: string;
  date: string;
  time?: string;
  description?: string;
  id: number
}

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch("/api/getEventsByDate");
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  return response.json();
};

export default function UpcomingEvents() {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const Router = useRouter();
  
  const handleEvent = (event: Event) => {
    Router.push(`/eventview?id=${event.id}`);
  };
  

  const calculateDays = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-primary mb-4 md:text-3xl font-serif">
          Upcoming Events
        </h2>
        <div className="animate-pulse space-y-4 md:grid md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 shadow-md" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold text-primary mb-4 md:text-3xl font-serif">
          Upcoming Events
        </h2>
        <p className="text-red-500 font-inter">Failed to load events.</p>
      </div>
    );
  }

  // Limit to three upcoming events
  const limitedEvents = events.slice(0, 3);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold text-primary mb-4 md:text-3xl font-serif">
        Upcoming Events
      </h2>

      {/* MOBILE Layout (unchanged) */}
      <div className="md:hidden">
        {limitedEvents.map((event) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;

          return (
            <div 
              key={event.name} 
              className="bg-categoryBg shadow-sm p-4 cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              onClick={() => handleEvent(event)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-primary font-inter">{event.name}</h3>
                  <p className="text-sm text-gray-600 font-inter">
                    {format(new Date(event.date), "MMMM do")}
                  </p>
                </div>
                <div className="text-sm text-gray-600 font-inter">
                  {isToday ? "Today" : `${daysUntil} days`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP Layout (slightly bigger text, more structured) */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6">
        {limitedEvents.map((event) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;

          return (
            <div
              key={event.name}
              className="bg-categoryBg p-6 border border-gray-200 shadow-sm cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              onClick={() => handleEvent(event)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-primary">
                  {event.name}
                </h3>
                <span className="text-sm text-gray-600">
                  {isToday ? "Today" : `${daysUntil} days`}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {format(new Date(event.date), "MMMM do")}
                {event.time && ` | ${event.time} (EST)`}
              </p>
              {event.description && (
                <p className="text-sm text-gray-600 mt-2">
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
