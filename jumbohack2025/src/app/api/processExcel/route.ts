import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../query/route'; // Import the query wrapper

export async function POST(request: Request) {
  try {
    // Read the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

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
      contact: row[2], // contact
      category: row[1],
      description: '', // empty description
      table_id: null, // empty table ID
    }));

    // Insert data into the database using the query wrapper
    for (const club of clubs) {
      await query(
        'INSERT INTO clubs (name, contact, description, table_id, category) VALUES ($1, $2, $3, $4, $5)',
        [club.name, club.contact, club.description, club.table_id, club.category]
      );
    }

    // Return the processed data
    return NextResponse.json({ message: 'Data uploaded successfully', clubs });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ message: 'Error processing file' }, { status: 500 });
  }
}