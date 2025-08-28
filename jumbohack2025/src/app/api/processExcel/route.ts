import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  let emailingEnabled = true; // Default value, will be overridden
  
  try {
    // Read the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const timedTable = formData.get('timedTable') as string;
    const timedTableBool = timedTable === 'true';
    const fallbackStartTime = formData.get('fallbackStartTime') as string;
    const fallbackEndTime = formData.get('fallbackEndTime') as string;
    emailingEnabled = formData.get('emailingEnabled') === 'true';
    const validateOnly = formData.get('validateOnly') === 'true'; // New flag
    const providedEventId = formData.get('eventId'); // Event ID for actual insertion

    console.log('Processing Excel with emailingEnabled:', emailingEnabled, 'validateOnly:', validateOnly);

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Get the event ID - either provided or get the latest
    let eventId: number;
    if (validateOnly) {
      eventId = 999999; // Dummy ID for validation
    } else if (providedEventId) {
      eventId = parseInt(providedEventId.toString(), 10);
    } else {
      const result = await query('SELECT MAX(id) as max_id FROM event', []);
      eventId = (result.rows[0]?.max_id ?? 0);
    }

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
          event_id: eventId,
          start_time: timedTableBool ? fallbackStartTime : fallbackStartTime,
          end_time: timedTableBool ? fallbackEndTime : fallbackEndTime,
        };
      } else {
        // When emailing is disabled: flexible parsing based on column count
        const rowArray = row as string[];
        const name = rowArray[0];
        const category = rowArray[1];
        
        let contact = '';
        let finalDescription = '';
        
        if (!name || !category) {
          throw new Error(`Row ${index + 2}: Name and category are required`);
        }
        
        if (rowArray.length >= 4) {
          // 4 columns: name, category, contact, description
          contact = rowArray[2] || ''; // Contact can be empty when emailing disabled
          finalDescription = rowArray[3] || '';
          
          if (!finalDescription) {
            throw new Error(`Row ${index + 2}: Description is required when emailing is disabled`);
          }
        } else if (rowArray.length >= 3) {
          // 3 columns: could be name, category, contact OR name, category, description
          const thirdColumn = rowArray[2] || '';
          
          // Check if third column looks like an email
          const isEmail = thirdColumn && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(thirdColumn);
          
          if (isEmail) {
            // Third column is contact, but no description column - this is invalid for emailing disabled
            throw new Error(`Row ${index + 2}: Description is required when emailing is disabled. Found contact but no description column.`);
          } else {
            // Third column is description, no contact
            contact = '';
            finalDescription = thirdColumn;
            
            if (!finalDescription) {
              throw new Error(`Row ${index + 2}: Description is required when emailing is disabled`);
            }
          }
        } else {
          throw new Error(`Row ${index + 2}: Not enough columns. Expected at least 3 columns when emailing is disabled.`);
        }

        return {
          name,
          category,
          contact, // Can be empty when emailing is disabled
          description: finalDescription,
          coordinates: null,
          confirmed: true, // Auto-confirmed when emailing is disabled
          event_id: eventId,
          start_time: timedTableBool ? fallbackStartTime : fallbackStartTime,
          end_time: timedTableBool ? fallbackEndTime : fallbackEndTime,
        };
      }
    });

    console.log('Processed clubs:', clubs.length);

    // If validateOnly is true, just return success without inserting data
    if (validateOnly) {
      return NextResponse.json({ 
        message: 'Spreadsheet validation successful', 
        clubCount: clubs.length,
        emailingEnabled
      });
    }

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
      eventId: eventId,
      emailingEnabled
    });
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Provide more user-friendly error messages
    let errorMessage = 'Error processing file';
    if (error instanceof Error) {
      if (error.message.includes('Row ') && error.message.includes('required')) {
        errorMessage = error.message; // Keep detailed row-level errors
      } else {
        errorMessage = `File processing error: ${error.message}`;
      }
    }
    
    return NextResponse.json({ 
      message: errorMessage,
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: emailingEnabled 
        ? 'Ensure your spreadsheet has Name, Category, and Contact columns with valid data.'
        : 'Ensure your spreadsheet has Name, Category, and Description columns. Contact column is optional.'
    }, { status: 500 });
  }
}