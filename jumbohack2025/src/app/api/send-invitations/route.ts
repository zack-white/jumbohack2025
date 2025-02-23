import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { emails } = await request.json();
    
    if (!Array.isArray(emails)) {
      return NextResponse.json(
        { message: 'Emails must be provided as an array' },
        { status: 400 }
      );
    }

    const results = await Promise.all(emails.map(async (email) => {
      const token = Buffer.from(email + Date.now().toString()).toString('base64');
      
      // Get existing user info if available
      const result = await query(
        'SELECT * FROM clubs WHERE contact = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        // Handle case where email isn't in database
        return { email, status: 'not_found' };
      }

      // Store the token temporarily (we'll discuss options for this)
      // This is needed for secure email response handling
      await query(
        'UPDATE clubs SET description = $1 WHERE contact = $2',
        [`pending_${token}`, email]
      );

      const yesLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=yes`;
      const noLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=no`;

      try {
        await sendEmail({
            to: email,
            subject: 'Event Invitation',
            html: `
            <h2>Are you coming to the event?</h2>
            <p>Please respond to this invitation:</p>
            <div>
                <a href="${yesLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; margin-right: 10px;">Yes</a>
                <a href="${noLink}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none;">No</a>
            </div>
            `
        });
      } catch (error) {
        console.error('Failed to send email:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
          { message: 'Failed to send email', error: errorMessage },
          { status: 500 }
        );
      }

      return { email, status: 'sent' };
    }));

    return NextResponse.json({ message: 'Invitations sent successfully', results });
  } catch (error) {
    console.error('Error sending invitations:', error);
    return NextResponse.json(
      { message: 'Error sending invitations' },
      { status: 500 }
    );
  }
}