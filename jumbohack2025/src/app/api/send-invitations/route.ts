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
    
    // Get clubs with the provided event_id that have coordinates but no confirmation
    const result = await query(
      'SELECT contact, name FROM clubs WHERE event_id = $1 AND confirmed = false AND description = \'\' AND coordinates IS NOT NULL',
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

    const emails = clubs.map(club => club.contact);
    console.log('Sending emails to:', emails);

    const results = await Promise.all(emails.map(async (email, index) => {
      try {
        const clubName = clubs[index].name;
        const token = Buffer.from(Date.now().toString() + email + Math.random().toString()).toString('hex');

        console.log(`Processing club: ${clubName}, email: ${email}`);

        // Store the token temporarily in description for secure email response handling
        await query(
          'UPDATE clubs SET description = $1 WHERE contact = $2 AND event_id = $3',
          [`pending_${token}`, email, event_id]
        );

        // Verify environment variables
        if (!process.env.NEXT_PUBLIC_BASE_URL) {
          throw new Error('NEXT_PUBLIC_BASE_URL environment variable is not set');
        }

        const yesLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=yes`;
        const noLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/invitation-response?token=${token}&response=no`;

        console.log(`Sending email to ${email}`);

        await sendEmail({
          to: email,
          subject: `Event Invitation - ${clubName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2E73B5;">Event Invitation</h2>
              <p>Hello ${clubName},</p>
              <p>You have been invited to participate in an upcoming event. Please confirm your attendance:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${yesLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; margin-right: 10px; border-radius: 4px; display: inline-block;">✓ Yes, I'll Attend</a>
                <a href="${noLink}" style="background-color: #f44336; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">✗ No, I Can't Attend</a>
              </div>
              <p style="color: #666; font-size: 14px;">If you have any questions, please contact the event organizers.</p>
            </div>
          `
        });

        console.log(`Email sent successfully to ${email}`);
        return { email, clubName, status: 'sent' };
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        return { email, status: 'failed', error: emailError.message };
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
    return NextResponse.json(
      { 
        message: 'Error sending invitations', 
        error: error.message,
        details: error.stack 
      },
      { status: 500 }
    );
  }
}