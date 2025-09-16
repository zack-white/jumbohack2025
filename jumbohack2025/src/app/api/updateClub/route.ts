import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'updateCoordinates': {
        const { id, x, y } = body;
        if (id == null || x == null || y == null) {
          return NextResponse.json({ message: 'Missing fields for coordinate update' }, { status: 400 });
        }

        await query(
          'UPDATE clubs SET coordinates = POINT($1, $2) WHERE id = $3',
          [x, y, id]
        );

        return NextResponse.json({ message: 'Coordinates updated successfully' });
      }

      case 'updateDetails': {
        const { id, name, category, contact, description } = body;
        if (!id || !name || !category || !contact ) {
          return NextResponse.json({ message: 'Missing fields for detail update' }, { status: 400 });
        }

        await query(
          'UPDATE clubs SET name = $1, category = $2, contact = $3, description = $4 WHERE id = $5',
          [name, category, contact, description, id]
        );

        return NextResponse.json({ message: 'Club details updated successfully' });
      }

      case 'removeCoordinates': {
        await query(
          'UPDATE clubs SET coordinates = NULL WHERE id = $1', 
          [body.id]
        );
        return NextResponse.json({ message: 'Coordinates removed' });
    }
      case 'deleteClub': {
        const { id } = body;
        if (id == null) {
          return NextResponse.json({ message: 'Missing club ID for deletion' }, { status: 400 });
        }

        await query(
          'DELETE FROM clubs WHERE id = $1',
          [id]
        );

        return NextResponse.json({ message: 'Club deleted successfully' });
      }

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
