import Link from 'next/link';
import Script from 'next/script';
import Head from 'next/head';
import React from 'react';
import MapboxMap from "./map/map";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Event Management Tool</h1>
      <Link
        href="/events/create"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Event
      </Link>
      <MapboxMap />
    </div>
  );
}