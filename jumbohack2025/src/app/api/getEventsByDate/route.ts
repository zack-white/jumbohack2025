import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function GET() {
  try {
    const result = await query(
      'SELECT name, date FROM event WHERE date >= CURRENT_DATE ORDER BY date ASC'
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