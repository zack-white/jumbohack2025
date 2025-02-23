import { NextResponse } from 'next/server';
import { query } from '../query/route';

export async function POST(request: Request) {

  try {
    const data = await request.json();
    const pointString = `(${data.location.x}, ${data.location.y})`;

    const {
      eventName,
      date,
      description,
      scale,
      startTime,
      duration
    } = data;

    const result = await query(
      `INSERT INTO event (name, description, date, location, scale, start_time, duration) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [
        eventName,
        description,
        date,
        pointString,
        scale,
        startTime,
        duration
      ]
    );

    return NextResponse.json({ 
      success: true, 
      eventId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating event' }, 
      { status: 500 }
    );
  }
}