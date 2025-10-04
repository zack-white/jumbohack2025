import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/query';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const response = searchParams.get('response');

  if (!token || (response !== 'yes' && response !== 'no')) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // console.log(`Processing invitation response: token=${token}, response=${response}`);
    
    // Find the user by the token we stored in description
    const result = await query(
      'SELECT * FROM clubs WHERE description = $1',
      [`pending_${token}`]
    );
    
    const user = result.rows[0];
    // console.log('Found user:', user ? { id: user.id, name: user.name, contact: user.contact } : 'None');

    if (!user) {
      return new Response(
        `
        <html>
          <head>
            <title>Invalid Link</title>
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
              <h2 class="error">Invalid or Expired Link</h2>
              <p>This invitation link is no longer valid. Please contact the event organizers if you need assistance.</p>
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
    }

    // Get the event name for email customization
    const eventResult = await query(
      'SELECT name FROM event WHERE id = $1',
      [user.event_id]
    );
    
    const eventName = eventResult.rows[0]?.name || 'the event';
    // console.log('Event name:', eventName);

    // Handle declined response
    if (response === 'no') {
      // console.log(`User declined invitation: ${user.contact}`);
      
      // Update description to indicate decline
      await query(
        'UPDATE clubs SET description = $1, confirmed = $2 WHERE id = $3',
        ['Declined invitation', false, user.id]
      );

      // Send email to admin if configured
      if (process.env.ADMIN_EMAIL) {
        try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `${eventName} Invitation Declined`,
            html: `
              <div style="font-family: Arial, sans-serif;">
                <h3>Invitation Declined</h3>
                <p><strong>Event:</strong> ${eventName}</p>
                <p><strong>Organization:</strong> ${user.name}</p>
                <p><strong>Contact:</strong> ${user.contact}</p>
                <p>This organization has declined the invitation to participate in the ${eventName}.</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send admin notification:', emailError);
        }
      }

      // Send confirmation to user
      try {
        await sendEmail({
          to: user.contact,
          subject: `${eventName} Response Confirmed`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h3>Response Confirmed</h3>
              <p>Hello ${user.name},</p>
              <p>We have received your response declining the invitation to participate in the <strong>${eventName}</strong>.</p>
              <p>Thank you for letting us know.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send user confirmation:', emailError);
      }

      // Return success HTML response
      return new Response(
        `
        <html>
          <head>
            <title>Response Received</title>
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
              .success { color: #059669; }
            </style>
          </head>
          <body>
            <div class="message">
              <h2 class="success">Thank you for your response</h2>
              <p>We have recorded that you will not be attending the event. A confirmation email has been sent to your inbox.</p>
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
    } else {
      // Handle accepted response (response === 'yes')
      // console.log(`User accepted invitation: ${user.contact}`);
      
      // Update confirmed status
      await query(
        'UPDATE clubs SET confirmed = $1 WHERE id = $2',
        [true, user.id]
      );
      
      // Verify base URL is configured
      if (!process.env.NEXT_PUBLIC_BASE_URL) {
        throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
      }
      
      // Redirect to registration form for 'yes' responses
      const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/registration?token=${token}`;
      // console.log(`Redirecting to: ${redirectUrl}`);
      
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error processing invitation response:', error);
    
    return new Response(
      `
      <html>
        <head>
          <title>Error</title>
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
            <h2 class="error">Something went wrong</h2>
            <p>There was an error processing your response. Please contact the event organizers for assistance.</p>
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