import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const { token, bio } = await request.json();
  
  if (!token || !bio) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Get the contact from database using the token
    const result = await query(
      'SELECT contact FROM clubs WHERE description = $1',
      [`pending_${token}`]
    );
    
    const club = result.rows[0];

    if (!club) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    // Update the database with the bio
    await query(
      'UPDATE clubs SET description = $1 WHERE description = $2',
      [bio, `pending_${token}`]
    );

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'Registration Complete',
      html: `
        <h3>New Registration</h3>
        <p>User: ${club.contact}</p>
        <p>Bio:</p>
        <pre>${bio}</pre>
      `
    });

    // Send confirmation to user
    await sendEmail({
      to: club.contact,
      subject: 'Registration Confirmed',
      html: `
        <h3>Your registration is complete!</h3>
        <p>We've received your information:</p>
        <pre>${bio}</pre>
        <p>Thank you for registering!</p>
      `
    });

    // Return custom HTML response
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
              width: 400px;
            }
          </style>
        </head>
        <body>
          <div class="message">
            <h2>Thank you for your registration</h2>
            <p>Your registration has been submitted successfully. An email confirmation has been sent to your inbox.</p>
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
    return NextResponse.json({ message: 'Error processing registration' }, { status: 500 });
  }
}