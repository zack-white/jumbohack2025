import { NextResponse } from 'next/server';
import { query } from '../../../lib/query';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, data } = body;
    console.log('Received event data:', data);
    console.log('Event ID to update:', id);
    
    const pointString = `(${data.location.x}, ${data.location.y})`;

    const {
      name,
      date,
      description,
      scale,
      start_time,
      end_time,
      organizationname,
      firstname,
      lastname,
      email,
      phonenumber,
      address,
      city,
      state,
      zipcode,
      creator,
      timedTables,
      emailingEnabled, // Just in case we want this at some point
    } = data;

    const result = await query(
       `UPDATE event SET name = $1, description = $2, date = $3, location = $4, scale = $5, start_time = $6, 
       end_time = $7, organizationname = $8, firstname = $9, lastname = $10, email = $11, phonenumber = $12, 
       address = $13, city = $14, state = $15, zipcode = $16, creator = $17, timedtables = $18 WHERE id = $19`,
      [
        name,
        description,
        date,
        pointString,
        scale,
        start_time,
        end_time,
        organizationname,
        firstname,
        lastname,
        email,
        phonenumber,
        address,
        city,
        state,
        zipcode,
        creator,
        timedTables,
        id
      ]
    );

    return NextResponse.json({ 
      success: true, 
      eventId: id
    });
  } catch (error) {
    console.error('Error updating event:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error updating event',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}