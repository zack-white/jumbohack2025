import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../query/route';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const eventData = JSON.parse(formData.get('event') as string);
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Insert event into the Event table
    const eventResult = await query(
      'INSERT INTO Event (name, date, location, length, width) VALUES ($1, $2, POINT($3, $4), $5, $6) RETURNING id',
      [eventData.name, eventData.date, eventData.latitude, eventData.longitude, eventData.length, eventData.width]
    );
    const eventId = eventResult.rows[0].id;

    // Process the Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Insert clubs with the event_id
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      await query(
        'INSERT INTO clubs (name, contact, description, coordinates, category, event_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [row[0], row[2], '', null, row[1], eventId]
      );
    }

    return NextResponse.json({ message: 'Event and clubs created successfully', eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ message: 'Error creating event' }, { status: 500 });
  }
}