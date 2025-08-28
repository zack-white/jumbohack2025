import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/query';

export async function POST(request: Request) {
  const { token, bio } = await request.json();
  
  if (!token || !bio) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    console.log(`Processing registration for token: ${token}`);
    
    // Get the club information using the token
    const result = await query(
      'SELECT * FROM clubs WHERE description = $1',
      [`pending_${token}`]
    );
    
    const club = result.rows[0];
    console.log('Found club:', club ? { id: club.id, name: club.name, contact: club.contact } : 'None');

    if (!club) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Get the event name
    const eventResult = await query(
      'SELECT name FROM event WHERE id = $1',
      [club.event_id]
    );
    
    const eventName = eventResult.rows[0]?.name || 'the event';
    console.log('Event name:', eventName);

    // Update the database with the bio
    await query(
      'UPDATE clubs SET description = $1 WHERE id = $2',
      [bio, club.id]
    );

    console.log(`Updated club description for ${club.name}`);

    // Send email to admin if configured
    if (process.env.ADMIN_EMAIL) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `${eventName} Registration Complete`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h3>${eventName} Registration Completed</h3>
              <p><strong>Organization:</strong> ${club.name}</p>
              <p><strong>Contact:</strong> ${club.contact}</p>
              <p><strong>Category:</strong> ${club.category || 'Not specified'}</p>
              <p><strong>Description/Bio:</strong></p>
              <div style="background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #2E73B5;">
                ${bio.replace(/\n/g, '<br>')}
              </div>
            </div>
          `
        });
        console.log('Admin notification sent');
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
      }
    }

    // Send confirmation to user
    try {
      await sendEmail({
        to: club.contact,
        subject: `${eventName} Registration Confirmed`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h3>Your registration is complete!</h3>
            <p>Hello ${club.name},</p>
            <p>Thank you for completing your registration for the <strong>${eventName}</strong>. We have received the following information:</p>
            <div style="background-color: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #2E73B5;">
              ${bio.replace(/\n/g, '<br>')}
            </div>
            <p>We look forward to seeing you at the ${eventName}!</p>
          </div>
        `
      });
      console.log('User confirmation sent');
    } catch (emailError) {
      console.error('Failed to send user confirmation:', emailError);
    }

    // Return success HTML response
    return new Response(
      `
      <html>
        <head>
          <title>Registration Complete</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f9fafb;
            }
            .message {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              max-width: 90%;
              width: 500px;
            }
            .success { color: #059669; }
          </style>
        </head>
        <body>
          <div class="message">
            <h2 class="success">Registration Complete!</h2>
            <p>Thank you for completing your registration, <strong>${club.name}</strong>.</p>
            <p>Your information has been submitted successfully and confirmation emails have been sent.</p>
            <p>We look forward to seeing you at the event!</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error processing registration:', error);
    
    return new Response(
      `
      <html>
        <head>
          <title>Registration Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f9fafb;
            }
            .message {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              max-width: 90%;
              width: 400px;
            }
            .error { color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="message">
            <h2 class="error">Registration Error</h2>
            <p>There was an error processing your registration. Please contact the event organizers for assistance.</p>
          </div>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 500
      }
    );
  }
}