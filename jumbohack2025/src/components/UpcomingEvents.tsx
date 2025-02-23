"use client";

import React from 'react';
import { format, formatDistance, differenceInDays } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';

interface Event {
  name: string;
  date: string;
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

  if (isLoading) {
    return (
      <div className="mt-8 animate-pulse">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upcoming Events</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-none shadow-sm mb-4">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upcoming Events</h2>
        <p className="text-red-500">Failed to load events</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upcoming Events</h2>
      {events.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No upcoming events</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const daysUntilEvent = differenceInDays(eventDate, new Date());
            const isLessThanAMonthAway = daysUntilEvent < 30;

            return (
              <Card key={event.name} className="border-none shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{event.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(eventDate, 'MMMM do')}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isLessThanAMonthAway
                      ? `${daysUntilEvent} days`
                      : formatDistance(eventDate, new Date(), { addSuffix: false })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}