import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/sendEmail';

// Placeholder functions for token handling and DB update
async function verifyToken(token: string) {
  // Replace with your actual token verification
  return { id: 'invitationId', email: 'goldmanwilliam3@gmail.com' };
}

async function updateInvitationStatus(invitationId: string, status: 'accepted' | 'rejected') {
  // Replace with your actual DB update
  return;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token, response: userResponse } = req.query;

  if (!token || (userResponse !== 'yes' && userResponse !== 'no')) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const invitation = await verifyToken(token as string);
  if (!invitation) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  if (userResponse === 'no') {
    await updateInvitationStatus(invitation.id, 'rejected');

    await sendEmail({
      to: process.env.YOUR_EMAIL!,
      subject: 'Invitation Rejected',
      html: `<p>User with email ${invitation.email} has rejected the invitation.</p>`,
    });

    return res.status(200).json({ message: 'Your rejection has been recorded. Thank you.' });
  } else {
    await updateInvitationStatus(invitation.id, 'accepted');
    res.writeHead(302, { Location: `/registration?token=${token}` });
    return res.end();
  }
}
