import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = Number(body.eventId);

    if (!eventId || isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Fetch all required data in parallel with a single transaction
    const [eventResult, locationResult, clubsResult] = await Promise.all([
      // Event name
      query('SELECT name FROM event WHERE id = $1', [eventId]),
      
      // Event location and scale
      query('SELECT location, scale FROM event WHERE id = $1', [eventId]),
      
      // Clubs for this event
      query(`
        SELECT id, name, category, coordinates, start_time, end_time
        FROM clubs
        WHERE event_id = $1 AND coordinates IS NOT NULL
      `, [eventId])
    ]);

    // Check if event exists
    if (!eventResult || eventResult.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const response = {
      event: {
        id: eventId,
        name: eventResult.rows[0].name
      },
      location: locationResult.rows[0]?.location || null,
      scale: locationResult.rows[0]?.scale || null,
      clubs: clubsResult.rows || []
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching event data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
