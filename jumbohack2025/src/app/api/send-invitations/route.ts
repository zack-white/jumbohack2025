import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/query';

export async function POST(request: Request) {
  const { event_id } = await request.json();

  if (!event_id) {
    return NextResponse.json(
      { message: 'Event ID must be provided' },
      { status: 400 }
    );
  }

  try {
    console.log('Fetching clubs for event_id:', event_id);
    
    // First, get the event name
    const eventResult = await query(
      'SELECT name FROM event WHERE id = $1',
      [event_id]
    );
    
    const eventName = eventResult.rows[0]?.name || 'the event';
    console.log('Event name:', eventName);
    
    // Get clubs with the provided event_id that have coordinates but no confirmation
    const result = await query(
      'SELECT contact, name FROM clubs WHERE event_id = $1 AND confirmed = false AND (description = \'\' OR description IS NULL) AND coordinates IS NOT NULL AND contact != \'\'',
      [event_id]
    );

    const clubs = result.rows;
    console.log('Found clubs:', clubs);

    if (clubs.length === 0) {
      return NextResponse.json(
        { message: `No clubs found for the provided event ID: ${event_id}` },
        { status: 200 } // Changed to 200 since this isn't really an error
      );
    }

    console.log('Sending invitations to clubs:', clubs.map(club => ({ name: club.name, contact: club.contact })));

    // Process each club individually (not grouping by email)
    const results = await Promise.all(clubs.map(async (club) => {
      try {
        const { contact: email, name: clubName } = club;
        const token = Buffer.from(Date.now().toString() + email + clubName + Math.random().toString()).toString('hex');

        console.log(`Processing club: ${clubName}, email: ${email}`);

        // Store the token temporarily in description for secure email response handling
        // Include club name in the search to handle multiple clubs with same email
        await query(
          'UPDATE clubs SET description = $1 WHERE contact = $2 AND event_id = $3 AND name = $4',
          [`pending_${token}`, email, event_id, clubName]
        );

        // Verify environment variables
        if (!process.env.NEXT_PUBLIC_BASE_URL) {
          throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
        }

        const yesLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=yes`;
        const noLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=no`;

        console.log(`Sending email to ${email} for club ${clubName}`);

        await sendEmail({
          to: email,
          subject: `${eventName} Invitation - ${clubName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E73B5;">${eventName} Invitation</h2>
              <p>Hello ${clubName},</p>
              <p>You have been invited to participate in the <strong>${eventName}</strong>. Please confirm your attendance:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${yesLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; margin-right: 10px; border-radius: 4px; display: inline-block;">✓ Yes, I'll Attend</a>
                <a href="${noLink}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">✗ No, I Can't Attend</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you have any questions, please contact the event organizers.</p>
            </div>
          `
        });

        console.log(`Email sent successfully to ${email} for club ${clubName}`);
        return { email, clubName, status: 'sent' };
      } catch (emailError) {
        console.error(`Failed to send email for club ${club.name}:`, emailError);
        let errorMessage = 'Unknown error';
        if (emailError instanceof Error) {
          errorMessage = emailError.message;
        }
        return { email: club.contact, clubName: club.name, status: 'failed', error: errorMessage };
}

    }));

    // Log results
    const successful = results.filter(r => r.status === 'sent');
    const failed = results.filter(r => r.status === 'failed');
    
    console.log(`Successfully sent ${successful.length} emails`);
    if (failed.length > 0) {
      console.log(`Failed to send ${failed.length} emails:`, failed);
    }

    return NextResponse.json({ 
      message: `Invitations processed: ${successful.length} sent, ${failed.length} failed`, 
      results,
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length
      }
    });
  } catch (error) {
    console.error('Error in send-invitations:', error);
    let errorMessage = 'Unknown error';
    let errorStack = undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    }

    return NextResponse.json(
      { 
        message: 'Error sending invitations', 
        error: errorMessage,
        details: errorStack
      },
      { status: 500 }
    );
  }

}