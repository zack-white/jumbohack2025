import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    // Read the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Get the latest event_id from the database
    const result = await query('SELECT MAX(id) as max_id FROM event', []);
    const nextEventId = (result.rows[0]?.max_id ?? 0) + 1;

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Process the data into the desired format
    const clubs = jsonData.slice(1).map((row: any) => ({
      name: row[0], // club name
      category: row[1], // category
      contact: row[2], // contact
      description: row[3] || '', // description (use empty string if undefined)
      coordinates: null, // coordinates
      confirmed: false, // not confirmed
      event_id: nextEventId // dynamic event ID
    }));

    // Insert data into the database using the query wrapper
    for (const club of clubs) {
      await query(
        'INSERT INTO clubs (name, category, contact, description, coordinates, confirmed, event_id) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          club.name,
          club.category,
          club.contact,
          club.description,
          club.coordinates,
          club.confirmed,
          club.event_id
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