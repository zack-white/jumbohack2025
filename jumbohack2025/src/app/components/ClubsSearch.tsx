import React, { useState, useEffect } from 'react';

// Define the interface for a Club object
interface Club {
  id: number;
  name: string;
}

export default function ClubsSearch({ eventId }: { eventId: number }) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Debounce the search so that we don't call the API on every keystroke
    const delayDebounceFn = setTimeout(() => {
      const fetchClubs = async () => {
        try {
          // Call the new API endpoint with the search query as a query parameter
          const response = await fetch(`/api/searchClubs?q=${encodeURIComponent(search)}`);
          if (!response.ok) {
            throw new Error(`Network response was not ok (status: ${response.status})`);
          }
          const data: Club[] = await response.json();
          setClubs(data);
        } catch (error) {
          console.error('Error fetching clubs:', error);
        }
      };
      fetchClubs();
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Who’s Attending?</h2>
      
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="Search attending clubs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <button
          type="button"
          style={{
            marginLeft: '8px',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: '#f3f3f3',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {/* Simple magnifying glass icon (inline SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001l3.85 3.85a1 1 0 001.415-1.414l-3.867-3.867zM12.5 6.5a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
        </button>
      </div>
      
      {/* Clubs List */}
      <div>
        {clubs.map((club) => (
          <div
            key={club.id}
            style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '8px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            {club.name}
          </div>
        ))}
      </div>
    </div>
  );
};