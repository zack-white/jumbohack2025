import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    // Read the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const timedTable = formData.get('timedTable') as string;
    const timedTableBool = timedTable === 'true';
    const fallbackStartTime = formData.get('fallbackStartTime') as string;
    const fallbackEndTime = formData.get('fallbackEndTime') as string;

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
      const [name, category, contact, description, rawStart, rawEnd]: ClubRow = row as ClubRow;

        // Convert Excel time serials to time strings if numbers, else fallback
        const start_time = typeof rawStart === 'number'
          ? excelTimeToTimeString(rawStart)
          : (timedTable === 'true' && rawStart ? rawStart : fallbackStartTime);

        const end_time = typeof rawEnd === 'number'
          ? excelTimeToTimeString(rawEnd)
          : (timedTable === 'true' && rawEnd ? rawEnd : fallbackEndTime);

      return {
        name,
        contact,
        description: description || '', // Default empty string if undefined
        category,
        event_id: nextEventId, // Dynamic event ID
        coordinates: null, // Coordinates are null initially
        confirmed: false, // Not confirmed
        start_time: timedTableBool && start_time ? start_time : fallbackStartTime, // Fallback to event times if empty
        end_time: timedTableBool && end_time ? end_time : fallbackEndTime, // Fallback to event times if empty
      };
    });

    // Insert data into the database using the query wrapper
    for (const club of clubs) {
      await query(
        'INSERT INTO clubs (name, contact, description, category, event_id, coordinates, confirmed, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          club.name,
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

function excelTimeToTimeString(excelTime: number): string {
  // Excel date 0 = 1899-12-31, so base date for Excel serial is 1899-12-30 in JS
  // fractional part of excelTime is the time portion of the day
  const secondsInDay = 24 * 60 * 60;

  const fractionalDay = excelTime % 1;
  const totalSeconds = Math.round(fractionalDay * secondsInDay);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format to HH:MM:SS (24-hour)
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}
