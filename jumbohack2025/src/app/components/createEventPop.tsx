'use client';

import { useState } from 'react';

export default function CreateEventModal({ onClose, onSubmit, center, zoom }) {
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState({ latitude: '', longitude: '' });
  const [eventLength, setEventLength] = useState('');
  const [eventWidth, setEventWidth] = useState('');
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('longtiude:', center.lng);
    console.log('latitude:', center.lat);
    console.log('zoom:', zoom);

    const eventData = {
      name: eventName,
      date: eventDate,
      desc: description,
      latitude: center.lat,
      longitude: center.lng,
      scale: zoom,
    };

    const formData = new FormData();
    formData.append('event', JSON.stringify(eventData));
    if (excelFile) {
      formData.append('file', excelFile);
    }

    try {
      const response = await fetch('/api/createEvent', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const result = await response.json();
      onSubmit(result.eventId); // Pass the event ID back to the parent
      onClose(); // Close the modal
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Error creating event. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Create Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Event Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          {/* <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Location (Latitude, Longitude)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Latitude"
                value={eventLocation.latitude}
                onChange={(e) => setEventLocation({ ...eventLocation, latitude: e.target.value })}
                className="w-1/2 p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Longitude"
                value={eventLocation.longitude}
                onChange={(e) => setEventLocation({ ...eventLocation, longitude: e.target.value })}
                className="w-1/2 p-2 border rounded"
                required
              />
            </div>
          </div> */}
          {/* <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Length</label>
            <input
              type="number"
              value={eventLength}
              onChange={(e) => setEventLength(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Width</label>
            <input
              type="number"
              value={eventWidth}
              onChange={(e) => setEventWidth(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div> */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Upload Clubs Excel</label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}