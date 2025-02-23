import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const response = searchParams.get('response');

  if (!token || (response !== 'yes' && response !== 'no')) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    // Find the user by the token we stored in description
    const result = await pool.query(
      'SELECT * FROM clubs WHERE description = $1',
      [`pending_${token}`]
    );
    
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    if (response === 'no') {
      // Update description
      await pool.query(
        'UPDATE clubs SET description = $1 WHERE id = $2',
        ['Declined invitation', user.id]
      );

      // Send email to admin
      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: 'Invitation Declined',
        html: `<p>User ${user.contact} has declined the invitation.</p>`
      });

      // Send confirmation to user
      await sendEmail({
        to: user.contact,
        subject: 'Invitation Response Confirmed',
        html: `<p>You have declined the invitation. Thank you for letting us know.</p>`
      });

      // Return an HTML response
      return new Response(
        `
        <html>
          <head>
            <title>Invitation Response</title>
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
              <h2>Thank you for your response</h2>
              <p>You have declined the invitation. An email confirmation has been sent to your inbox.</p>
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
      // Redirect to registration form for 'yes' responses
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/registration?token=${token}`);
    }
  } catch (error) {
    console.error('Error processing response:', error);
    return NextResponse.json({ message: 'Error processing response' }, { status: 500 });
  }
}