import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  const { event_id } = await request.json();

  if (!event_id) {
    return NextResponse.json(
      { message: 'Event ID must be provided' },
      { status: 400 }
    );
  }

  try {
    // Get clubs with the provided event_id
    const result = await query(
      'SELECT contact FROM clubs WHERE event_id = $1 AND confirmed = false AND description IS NULL AND coordinates IS NOT NULL',
      [event_id]
    );

    const clubs = result.rows;

    if (clubs.length === 0) {
      return NextResponse.json(
        { message: 'No clubs found for the provided event ID' },
      );
    }

    console.log(clubs);

    const emails = clubs.map(club => club.contact);

    const results = await Promise.all(emails.map(async (email) => {
      const token = Buffer.from(Date.now().toString() + email).toString('hex');

      // Store the token temporarily -- needed for secure email response handling
      await query(
        'UPDATE clubs SET description = $1 WHERE contact = $2',
        [`pending_${token}`, email]
      );

      const yesLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=yes`;
      const noLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=no`;

      console.log('about to send email');

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