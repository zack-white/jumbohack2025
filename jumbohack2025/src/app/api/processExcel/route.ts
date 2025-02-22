import { NextResponse } from 'next/server';
import { read, utils } from 'xlsx';

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
    const workbook = read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = utils.sheet_to_json(sheet, { header: 1 });

    // Process the data into the desired format
    const clubs = jsonData.slice(1).map((row: any) => ({
      name: row[0], // club name
      contact: row[2], // contact
      description: '', // empty description
      table_id: '', // empty table ID
    }));

    // Return the processed data
    return NextResponse.json(clubs);
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ message: 'Error processing file' }, { status: 500 });
  }
}