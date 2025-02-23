import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function POST(request: Request) {
  try {
    const { id, x, y } = await request.json();

    // Update the club's coordinates
    await query(
      'UPDATE clubs SET coordinates = POINT($1, $2) WHERE id = $3',
      [x, y, id]
    );

    return NextResponse.json({ message: 'Club updated successfully' });
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ message: 'Error updating club' }, { status: 500 });
  }
}