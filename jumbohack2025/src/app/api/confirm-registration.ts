import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/sendEmail';

// Placeholder functions for token handling and DB update
async function verifyToken(token: string) {
  // Replace with your actual token verification
  return { id: 'invitationId', email: 'goldmanwilliam3@gmail.com' };
}

async function finalizeInvitation(invitationId: string, additionalData: any) {
  // Replace with your actual DB save operation
  return;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, additionalData } = req.body;
  if (!token || !additionalData) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const invitation = await verifyToken(token);
  if (!invitation) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  await finalizeInvitation(invitation.id, additionalData);

  await sendEmail({
    to: process.env.YOUR_EMAIL!,
    subject: 'Invitation Confirmed',
    html: `<p>User ${invitation.email} has confirmed the invitation with the following details: ${JSON.stringify(
      additionalData
    )}</p>`,
  });

  return res.status(200).json({ message: 'Registration complete. Thank you!' });
}
