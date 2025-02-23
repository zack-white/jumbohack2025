import { NextResponse } from 'next/server';
import { query } from '../query/route'; 

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { x, y } = body;

        // Query database correctly
        const result = await query(
            "SELECT id, name, description FROM clubs WHERE coordinates ~= point($1, $2)",
            [x, y]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        return NextResponse.json({ message: 'Error fetching clubs' }, { status: 500 });
    }
}
