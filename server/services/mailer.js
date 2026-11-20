import nodemailer from 'nodemailer';

export async function sendContactEmail({ name, email, subject, category, message, toEmail }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || 'noreply@flippy.studio';
  const recipient = toEmail || process.env.CONTACT_TO_EMAIL || 'hello@branchout.studio';

  if (!host || !user || !pass) {
    return {
      mode: 'simulated',
      recipient,
      note: 'SMTP credentials not configured; message persisted in database for Admin Panel.',
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    from: `"Flippy Studio Contact" <${from}>`,
    to: recipient,
    replyTo: email,
    subject: `[Flippy ${category.toUpperCase()}] ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\n${message}`,
    html: `
      <div style="font-family:sans-serif;padding:20px;background:#0a0b0e;color:#fff;">
        <h2 style="color:#00C2FF;">New Flippy Studio Contact Message</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border-color:#222;" />
        <p style="white-space:pre-wrap;">${message}</p>
      </div>
    `,
  });

  return {
    mode: 'smtp',
    recipient,
    messageId: info.messageId,
  };
}
