import { NextResponse } from 'next/server';

const isValidEmail = (value) => {
  if (typeof value !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const clampString = (value, maxLen) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    const name = clampString(body?.name ?? '', 100);
    const email = clampString(body?.email ?? '', 320);
    const message = clampString(body?.message ?? '', 4000);

    const website = clampString(body?.website ?? '', 200);
    const startedAt = body?.startedAt;

    if (website) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    const elapsedMs = Date.now() - startedAt;
    if (elapsedMs < 1500) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please provide a valid email.' }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: 'Please provide a longer message.' }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'masonym.dev <onboarding@resend.dev>';

    if (!resendApiKey || !toEmail) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 500 });
    }

    const subjectPrefix = process.env.CONTACT_SUBJECT_PREFIX || '[masonym.dev]';
    const subject = `${subjectPrefix} New message from ${name || email}`;

    const text = [
      `name: ${name || '(not provided)'}`,
      `email: ${email}`,
      '',
      message,
    ].join('\n');

    const html = `
      <div>
        <p><strong>name:</strong> ${name ? name.replaceAll('<', '&lt;').replaceAll('>', '&gt;') : '(not provided)'}</p>
        <p><strong>email:</strong> ${email.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</p>
        <hr />
        <pre style="white-space:pre-wrap;">${message
          .replaceAll('&', '&amp;')
          .replaceAll('<', '&lt;')
          .replaceAll('>', '&gt;')}</pre>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        text,
        html,
        reply_to: email,
      }),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text().catch(() => '');
      console.error('Resend send failed:', resendResponse.status, errText);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
