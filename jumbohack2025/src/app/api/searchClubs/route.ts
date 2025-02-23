import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  try {
    let result;
    if (q.trim()) {
      // Use ILIKE for a case-insensitive search matching anywhere in the club name
      result = await query(
        `SELECT id, name, description, category, coordinates FROM clubs WHERE name ILIKE '%' || $1 || '%' AND coordinates IS NULL`,
        [q]
      );
    } else {
      // If no search query, return all clubs for the hardcoded event ID
      const eventId = 1;
      result = await query(
        `SELECT id, name, category, description, coordinates FROM clubs WHERE event_id = $1 AND coordinates IS NULL`,
        [eventId]
      );
    }
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ message: 'Error fetching clubs' }, { status: 500 });
  }
}