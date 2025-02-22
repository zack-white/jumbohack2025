"use client";

// pages/index.tsx
import Script from 'next/script';
import Head from 'next/head';
import React from 'react';
import MapboxMap from "./map/map";

export default function Home() {
  return (
    <>
      <div>
      <MapboxMap />
    </div>
    </>
  );
}
