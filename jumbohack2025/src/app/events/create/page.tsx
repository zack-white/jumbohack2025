'use client';

import { useState } from 'react';
import CreateEventModal from '../../components/createEventPop';

export default function CreateEventPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create a New Event</h1>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Event
      </button>

      {isModalOpen && (
        <CreateEventModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(id) => setEventId(id)}
        />
      )}

      {eventId && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">Event Created Successfully!</h2>
          <p>Event ID: {eventId}</p>
        </div>
      )}
    </div>
  );
}