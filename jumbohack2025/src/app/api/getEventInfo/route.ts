import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function GET(request: Request) {
  try {
    // Extract eventId from the query parameters
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { message: 'Missing eventId parameter' },
        { status: 400 }
      );
    }

    // Query for both location and scale in one go (assuming both columns are in the same table)
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
