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
    const emailingEnabled = formData.get('emailingEnabled') === 'true';

    console.log('Processing Excel with emailingEnabled:', emailingEnabled);

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

    // Define different types based on emailing enabled
    type ClubRowWithEmail = [string, string, string, string?]; // name, category, contact, description (optional when emailing enabled)
    type ClubRowWithoutEmail = [string, string, string?, string?]; // name, category, contact (optional), description (required when emailing disabled)

    // Process the data into the desired format
    const clubs = jsonData.slice(1).map((row, index) => {
      if (emailingEnabled) {
        // When emailing is enabled: name, category, contact (required), description (optional)
        const [name, category, contact, description]: ClubRowWithEmail = row as ClubRowWithEmail;
        
        if (!name || !category || !contact) {
          throw new Error(`Row ${index + 2}: Name, category, and contact are required when emailing is enabled`);
        }
        
        return {
          name,
          category,
          contact,
          description: description || '', // Optional, will be filled via email workflow
          coordinates: null,
          confirmed: false,
          event_id: nextEventId,
          start_time: timedTableBool ? fallbackStartTime : fallbackStartTime,
          end_time: timedTableBool ? fallbackEndTime : fallbackEndTime,
        };
      } else {
        // When emailing is disabled: name, category, contact (optional), description (required)
        const [name, category, contactOrDescription, description]: ClubRowWithoutEmail = row as ClubRowWithoutEmail;
        
        if (!name || !category) {
          throw new Error(`Row ${index + 2}: Name and category are required`);
        }

        // Determine if third column is contact (email format) or description
        const isThirdColumnEmail = contactOrDescription && 
          typeof contactOrDescription === 'string' && 
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactOrDescription);

        let contact: string | null = null;
        let finalDescription: string;

        if (isThirdColumnEmail) {
          // Third column is email, fourth column should be description
          contact = contactOrDescription;
          if (!description) {
            throw new Error(`Row ${index + 2}: Description is required when emailing is disabled`);
          }
          finalDescription = description;
        } else {
          // Third column is description, no contact provided
          if (!contactOrDescription) {
            throw new Error(`Row ${index + 2}: Description is required when emailing is disabled`);
          }
          finalDescription = contactOrDescription;
        }

        return {
          name,
          category,
          contact: contact || '', // Empty string if no contact provided
          description: finalDescription,
          coordinates: null,
          confirmed: true, // Auto-confirmed when emailing is disabled
          event_id: nextEventId,
          start_time: timedTableBool ? fallbackStartTime : fallbackStartTime,
          end_time: timedTableBool ? fallbackEndTime : fallbackEndTime,
        };
      }
    });

    console.log('Processed clubs:', clubs.length);

    // Insert data into the database using the query wrapper
    for (const club of clubs) {
      await query(
        'INSERT INTO clubs (name, category, contact, description, coordinates, confirmed, event_id, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [
          club.name,
          club.category,
          club.contact,
          club.description,
          club.coordinates,
          club.confirmed,
          club.event_id,
          club.start_time,
          club.end_time
        ]
      );
    }

    // Return the processed data
    return NextResponse.json({ 
      message: 'Data uploaded successfully', 
      clubs,
      eventId: nextEventId,
      emailingEnabled
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ 
      message: 'Error processing file', 
      error: (error as Error).message 
    }, { status: 500 });
  }
}