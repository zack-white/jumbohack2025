import { NextResponse } from 'next/server';
import { query } from '../query/route'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body.eventID;
    console.log(eventId)
    const result = await query(
      'SELECT id, name, category, coordinates FROM clubs WHERE event_id = $1 AND coordinates IS NOT NULL',
      [eventId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ message: 'Error fetching clubs' }, { status: 500 });
  }
}