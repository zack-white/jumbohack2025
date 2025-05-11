import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

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
      duration,
      organizationName,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      creator,
    } = data;

    const result = await query(
      `INSERT INTO event (name, description, date, location, scale, start_time, 
       duration, organizationName, firstName, lastName, email, phoneNumber, 
       address, city, state, zipCode, creator) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
       RETURNING id`,
      [
        eventName,
        description,
        date,
        pointString,
        scale,
        startTime,
        duration,
        organizationName,
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
        creator
      ]
    );

    return NextResponse.json({ 
      success: true, 
      eventId: result.rows[0].id - 1
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating event' }, 
      { status: 500 }
    );
  }
}