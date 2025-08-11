import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action } = body;

        let result;

        switch (action) {
            case 'findByCoords': {
                const { x, y } = body;
                if (x == null || y == null) {
                    return NextResponse.json({ message: 'Missing coordinates' }, { status: 400 });
                }

                result = await query(
                    "SELECT id, name, description, contact, category FROM clubs WHERE coordinates ~= point($1, $2)",
                    [x, y]
                );
                return NextResponse.json(result.rows[0] ?? {});
            }

            case 'findById': {
                const { id } = body;
                if (!id) {
                    return NextResponse.json({ message: 'Missing club ID' }, { status: 400 });
                }

                result = await query(
                    "SELECT id, name, description, contact, category, event_id FROM clubs WHERE id = $1",
                    [id]
                );
                return NextResponse.json(result.rows[0] ?? {});
            }

            default:
                return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in club query:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
