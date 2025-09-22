import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function GET() {
  try {
    const result = await query(
      'SELECT name, date, start_time, description, id FROM event WHERE date >= CURRENT_DATE AND creator = $1 ORDER BY date ASC',
      ['angie.zhang@tufts.edu']
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}