import React from 'react';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Thank you for confirming</h1>
        <p className="text-gray-700">Please see your email for a copy of your responses.</p>
      </div>
    </div>
  );
}