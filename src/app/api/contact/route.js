
export const runtime = 'edge';

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {'content-type': 'application/json'},
  });

export async function GET() {
  return json({
    ok: true,
    configured: {
      RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
      CONTACT_TO_EMAIL: Boolean(process.env.CONTACT_TO_EMAIL),
      CONTACT_FROM_EMAIL: Boolean(process.env.CONTACT_FROM_EMAIL),
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    const email = body?.email ?? '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({error: 'invalid email'}, 400);
    }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL],
        subject: 'hello',
        text: body.message,
        reply_to: email,
      }),
    });

    if (!r.ok) {
      const t = await r.text().catch(() => '');
      return json({error: 'send failed', provider: t}, 502);
    }

    return json({ok: true});
  } catch (e) {
    return json({error: 'unexpected'}, 500);
  }
}
