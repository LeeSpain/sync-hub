export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const apps = [
    { id: 'll', name: 'LifeLink Sync', url: 'https://www.lifelink-sync.com/', color: '#e84c6a' },
    { id: 'vs', name: 'Vision-Sync Forge', url: 'https://www.vision-sync.co/', color: '#7c5cfc' },
    { id: 'ss', name: 'AI Sales Sync', url: 'https://www.aisales-sync.com/', color: '#0d9f6e' }
  ];

  const results = [];

  for (const app of apps) {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(app.url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timeout);

      const latency = Date.now() - start;

      results.push({
        id: app.id,
        name: app.name,
        url: app.url,
        color: app.color,
        status: response.ok ? 'online' : 'degraded',
        statusCode: response.status,
        latency,
        checkedAt: new Date().toISOString()
      });
    } catch (err) {
      results.push({
        id: app.id,
        name: app.name,
        url: app.url,
        color: app.color,
        status: 'down',
        statusCode: 0,
        latency: Date.now() - start,
        error: err.name === 'AbortError' ? 'Timeout (8s)' : err.message,
        checkedAt: new Date().toISOString()
      });
    }
  }

  // If Twilio is configured and any app is down, send SMS alert
  const downApps = results.filter(r => r.status === 'down');
  if (downApps.length > 0 && process.env.TWILIO_SID) {
    try {
      const sid = process.env.TWILIO_SID;
      const token = process.env.TWILIO_TOKEN;
      const from = process.env.TWILIO_NUMBER;
      const to = process.env.LEE_PHONE;

      if (sid && token && from && to) {
        const names = downApps.map(a => a.name).join(', ');
        const message = 'SYNC HUB ALERT: ' + names + ' is not responding. Check immediately.';
        const twilioUrl = 'https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json';
        const auth = Buffer.from(sid + ':' + token).toString('base64');

        await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + auth,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ To: to, From: from, Body: message })
        });
      }
    } catch (smsErr) {
      // SMS failure should not break health check response
    }
  }

  res.status(200).json({
    connected: true,
    apps: results,
    allHealthy: results.every(r => r.status === 'online'),
    checkedAt: new Date().toISOString()
  });
}
