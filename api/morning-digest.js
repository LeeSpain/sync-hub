export default async function handler(req, res) {
  // This endpoint is called by Vercel Cron at 07:00 UTC daily
  // It gathers data from all sources and sends a single SMS summary

  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_NUMBER;
  const to = process.env.LEE_PHONE;

  if (!sid || !token || !from || !to) {
    return res.status(200).json({ sent: false, error: 'Twilio not configured' });
  }

  const parts = ['SYNC HUB — Morning Digest'];

  // 1. Stripe revenue (if configured)
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      const headers = { 'Authorization': 'Bearer ' + stripeKey };
      const now = new Date();
      const yesterdayStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000);
      const yesterdayEnd = yesterdayStart + 86400;

      const chargesRes = await fetch(
        'https://api.stripe.com/v1/charges?limit=100&created[gte]=' + yesterdayStart + '&created[lt]=' + yesterdayEnd,
        { headers }
      );
      const chargesData = await chargesRes.json();
      const charges = (chargesData.data || []).filter(c => c.status === 'succeeded');
      const total = charges.reduce((sum, c) => sum + c.amount, 0) / 100;
      parts.push('Revenue yesterday: \u00a3' + total.toLocaleString('en-GB'));
    }
  } catch (e) {
    parts.push('Revenue: unavailable');
  }

  // 2. App health
  try {
    const apps = [
      { name: 'LifeLink', url: 'https://www.lifelink-sync.com/' },
      { name: 'Vision-Sync', url: 'https://www.vision-sync.co/' },
      { name: 'AI Sales', url: 'https://www.aisales-sync.com/' }
    ];
    const statuses = [];
    for (const app of apps) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const r = await fetch(app.url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
        clearTimeout(timeout);
        statuses.push(app.name + ': ' + (r.ok ? 'OK' : 'Issue'));
      } catch (e) {
        statuses.push(app.name + ': DOWN');
      }
    }
    parts.push('Apps: ' + statuses.join(' | '));
  } catch (e) {
    parts.push('App health: unavailable');
  }

  // 3. Gmail unread count (if configured)
  try {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (clientId && clientSecret && refreshToken) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const unreadRes = await fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&labelIds=UNREAD&maxResults=1',
          { headers: { 'Authorization': 'Bearer ' + tokenData.access_token } }
        );
        const unreadData = await unreadRes.json();
        parts.push('Unread emails: ' + (unreadData.resultSizeEstimate || 0));
      }
    }
  } catch (e) {
    // skip email count
  }

  // Send the digest SMS
  try {
    const message = parts.join('\n');
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';
    const auth = Buffer.from(sid + ':' + token).toString('base64');

    const smsRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ To: to, From: from, Body: message })
    });
    const smsData = await smsRes.json();

    res.status(200).json({ sent: !smsData.error_code, message, sid: smsData.sid });
  } catch (err) {
    res.status(200).json({ sent: false, error: err.message });
  }
}
