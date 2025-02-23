"use client";

import { useState } from 'react';

export default function SendInvitations() {
  const [emails, setEmails] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');

    const emailList = emails.split('\n').map(email => email.trim()).filter(Boolean);
    
    try {
      const response = await fetch('/api/send-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStatus(data.message);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error sending invitations. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Send Invitations</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Enter email addresses (one per line):
          </label>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            rows={10}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Sending...' : 'Send Invitations'}
        </button>
      </form>
      {status && (
        <p className={`mt-4 text-center ${
          status.includes('Error') ? 'text-red-600' : 'text-green-600'
        }`}>
          {status}
        </p>
      )}
    </div>
  );
}