import { NextResponse } from 'next/server';
import { query } from '../../../lib/query'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body.eventID;

    const result = await query(
      'SELECT location, scale FROM event WHERE id = $1',
      [eventId]
    );

    const location = result.rows[0]?.location;
    const scale = result.rows[0]?.scale;

    // Return both values in a single JSON object
    return NextResponse.json({ location, scale });
  } catch (error) {
    console.error('Error fetching eventElem:', error);
    return NextResponse.json(
      { message: 'Error fetching eventElem' },
      { status: 500 }
    );
  }
}