import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  try {
    const {
      selectedReason,
      description,
      priority,
      additionalInfo,
      file, // optional
    } = await req.json();

    const emailHtml = `
      <h2>New Bug Report Submitted</h2>
      <p><strong>Reason:</strong> ${selectedReason || 'N/A'}</p>
      <p><strong>Priority:</strong> ${priority || 'N/A'}</p>
      <p><strong>Description:</strong></p>
      <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 1rem;">${description}</pre>
      <p><strong>Additional Info:</strong></p>
      <pre style="white-space: pre-wrap; background: #f4f4f4; padding: 1rem;">${additionalInfo || 'None'}</pre>
      ${file?.name ? `<p><strong>File Uploaded:</strong> ${file.name}</p>` : ''}
    `;

    await sendEmail({
      to: 'daniel.glorioso@tufts.edu',
      subject: `Bug Report: ${selectedReason || 'No Reason'}`,
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Bug report sent successfully' });
  } catch (error) {
    console.error('Bug report error:', error);
    return NextResponse.json({ error: 'Failed to send bug report' }, { status: 500 });
  }
}
