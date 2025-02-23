"use client";

import React from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface Event {
  name: string;
  date: string;
  time?: string;
  description?: string;
}

const fetchEvents = async (): Promise<Event[]> => {
  const response = await fetch('/api/getEventsByDate');
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }
  return response.json();
};

export default function UpcomingEvents() {
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const calculateDays = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="mt-2">
        <h2 className="text-xl font-medium text-gray-900 mb-4">Upcoming Events</h2>
        <div className="animate-pulse space-y-0 md:grid md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 shadow-md"></div>
          ))}
        </div>
      </div>
    );
  }

  // Mobile version (default) and desktop version with media queries
  return (
    <div className="mt-6">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Upcoming Events</h2>
      
      {/* Mobile Layout */}
      <div className="md:hidden space-y-1">
        {events.map((event, index) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;
          const isLast = index === events.length - 1;
          
          return (
            <div key={event.name} className={`bg-white p-4 ${isLast ? 'shadow-lg' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(event.date), 'MMMM do')}
                  </p>
                </div>
                <div className="text-sm text-gray-600">
                  {isToday ? 'Today' : `${daysUntil} days`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6">
        {events.map((event, index) => {
          const daysUntil = calculateDays(event.date);
          const isToday = daysUntil === 0;
          const isLast = index === events.length - 1;
          
          return (
            <div key={event.name} className={`bg-white p-6 border border-gray-200 ${isLast ? 'shadow-lg' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-gray-900">{event.name}</h3>
                <span className="text-sm text-gray-600">
                  {isToday ? 'Today' : `${daysUntil} days`}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {format(new Date(event.date), 'MMMM do')}
                {event.time && (
                  <span className="block">
                    {event.time} (EST)
                  </span>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-gray-600 mt-4">
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