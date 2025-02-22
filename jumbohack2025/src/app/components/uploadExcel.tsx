'use client'; // Mark as a Client Component

import { useState } from 'react';

export default function FileUpload() {
  const [processedData, setProcessedData] = useState([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send the file to the serverless function
      const response = await fetch('/api/processExcel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      setProcessedData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing file. Please try again.');
    }
  };

  return (
    <div>
      <h1>Upload Excel File</h1>
      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
      <h2>Processed Data:</h2>
      <pre>{JSON.stringify(processedData, null, 2)}</pre>
    </div>
  );
}