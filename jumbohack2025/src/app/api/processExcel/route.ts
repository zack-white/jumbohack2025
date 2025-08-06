import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    // Read the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const timedTable = formData.get('timedTable') as string;
    const fallbackStartTime = formData.get('startTime') as string;
    const fallbackEndTime = formData.get('endTime') as string;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Get the latest event_id from the database
    const result = await query('SELECT MAX(id) as max_id FROM event', []);
    const nextEventId = (result.rows[0]?.max_id ?? 0);

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Define a type for rows
    type ClubRow = [string, string, string, string?, string?, string?]; // name, category, contact, description (optional), start_time (optional), end_time (optional)

    // Process the data into the desired format
    const clubs = jsonData.slice(1).map((row) => {
      const [name, category, contact, description, start_time, end_time]: ClubRow = row as ClubRow;
      return {
        name,
        category,
        contact,
        description: description || '', // Default empty string if undefined
        coordinates: null, // Coordinates are null initially
        confirmed: false, // Not confirmed
        event_id: nextEventId, // Dynamic event ID
        start_time: timedTable && start_time ? start_time : fallbackStartTime, // Fallback to event times if empty
        end_time: timedTable && end_time ? end_time : fallbackEndTime, // Fallback to event times if empty
      };
    });

    // Insert data into the database using the query wrapper
    for (const club of clubs) {
      await query(
        'INSERT INTO clubs (name, contact, description, category, event_id, coordinates, confirmed, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          club.name,
          club.category,
          club.event_id,
          club.contact,
          club.description,
          club.category,
          club.event_id,
          club.coordinates,
          club.confirmed,
          club.start_time,
          club.end_time
        ]
      );
    }

    // Return the processed data
    return NextResponse.json({ 
      message: 'Data uploaded successfully', 
      clubs,
      eventId: nextEventId 
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      message: 'Error processing file', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
