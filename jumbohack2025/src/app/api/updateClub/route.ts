import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function POST(request: Request) {
  try {
    const { id, coordinates } = await request.json();

    await query(
      'UPDATE clubs SET coordinates = $1 WHERE id = $2',
      [coordinates, id]
    );

    return NextResponse.json({ message: 'Club updated successfully' });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ message: 'Error updating club' }, { status: 500 });
  }
}