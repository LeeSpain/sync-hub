export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_NUMBER;
  const to = process.env.LEE_PHONE;

  if (!sid || !token || !from || !to) {
    return res.status(200).json({ connected: false, sent: false, error: 'Twilio credentials not set' });
  }

  try {
    const { message } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!message) {
      return res.status(400).json({ sent: false, error: 'No message provided' });
    }

    // Send SMS via Twilio REST API (no SDK needed)
    const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';
    const auth = Buffer.from(sid + ':' + token).toString('base64');

    const smsRes = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: message
      })
    });

    const smsData = await smsRes.json();

    if (smsData.error_code) {
      return res.status(200).json({ connected: true, sent: false, error: smsData.message });
    }

    res.status(200).json({ connected: true, sent: true, sid: smsData.sid });
  } catch (err) {
    res.status(200).json({ connected: false, sent: false, error: err.message });
  }
}
