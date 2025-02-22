import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function GET() {
  try {
    const eventId = 1; // Hardcoded event ID
    const result = await query(
      'SELECT * FROM clubs WHERE event_id = $1',
      [eventId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ message: 'Error fetching clubs' }, { status: 500 });
  }
}