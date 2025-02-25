import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    console.log(id);

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Run the SQL query and log results
    const event = await query(`SELECT * FROM event WHERE id = $1`, [id]);

    console.log(event.rows);

    // Fix: Check event.rows.length instead of event.length
    if (!event || event.rows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event.rows);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
