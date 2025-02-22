import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporterPromise: Promise<nodemailer.Transporter>;

if (process.env.NODE_ENV === 'production') {
  // In production, use your real SMTP credentials
  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., smtp.gmail.com or smtp.sendgrid.net
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true if port is 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  );
} else {
  // In development, create an Ethereal account
  transporterPromise = nodemailer.createTestAccount().then((testAccount) => {
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const transporter = await transporterPromise;
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Your App Name" wgoldm03@tufts.edu',
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  // Log the preview URL for Ethereal (only available in development)
  console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  return info;
}
