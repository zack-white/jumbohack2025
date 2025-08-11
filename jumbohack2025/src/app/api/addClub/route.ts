import { NextResponse } from 'next/server';
import { query } from '../../../lib/query'; // adjust this path based on your project structure

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, contact, category, description, coordinates, confirmed, event_id } = body;

    if (!name || !contact || !category || !event_id) {
      return NextResponse.json(
        { message: 'Missing required fields', error: 'name, contact, category, and event_id are required' },
        { status: 400 }
      );
    }

    await query(
      `INSERT INTO clubs (name, category, contact, description, coordinates, confirmed, event_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, category, contact, description, coordinates, confirmed, event_id]
    );

    return NextResponse.json({ message: 'Club added successfully' });
  } catch (error) {
    console.error('Error adding club:', error);
    return NextResponse.json(
      { message: 'Error adding club', error: (error as Error).message },
      { status: 500 }
    );
  }
}
