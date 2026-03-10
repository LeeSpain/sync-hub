export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return res.status(200).json({ connected: false, error: 'Gmail credentials not set' });
  }

  try {
    // Refresh the access token
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

    if (!tokenData.access_token) {
      return res.status(200).json({ connected: false, error: 'Token refresh failed' });
    }

    const accessToken = tokenData.access_token;
    const gHeaders = { 'Authorization': 'Bearer ' + accessToken };

    // Fetch inbox messages (last 20)
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
      { headers: gHeaders }
    );
    const listData = await listRes.json();

    if (!listData.messages) {
      return res.status(200).json({ connected: true, emails: [], unreadCount: 0 });
    }

    // Fetch each message's metadata
    const emails = [];
    const msgIds = listData.messages.slice(0, 12); // limit to 12 for speed

    for (const msg of msgIds) {
      const msgRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/' + msg.id + '?format=full',
        { headers: gHeaders }
      );
      const msgData = await msgRes.json();

      const getHeader = (name) => {
        const h = (msgData.payload && msgData.payload.headers || []).find(h => h.name.toLowerCase() === name.toLowerCase());
        return h ? h.value : '';
      };

      // Extract body text
      let body = '';
      if (msgData.payload) {
        if (msgData.payload.body && msgData.payload.body.data) {
          body = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (msgData.payload.parts) {
          const textPart = msgData.payload.parts.find(p => p.mimeType === 'text/plain');
          if (textPart && textPart.body && textPart.body.data) {
            body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
          }
        }
      }

      // Clean body — strip HTML tags if any leaked through
      body = body.replace(/<[^>]*>/g, '').trim();
      if (body.length > 500) body = body.substring(0, 500) + '...';

      const isUnread = (msgData.labelIds || []).includes('UNREAD');
      const from = getHeader('From');
      // Extract just the name part from "Name <email@example.com>"
      const fromName = from.includes('<') ? from.split('<')[0].trim().replace(/"/g, '') : from;

      const date = new Date(parseInt(msgData.internalDate));
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const timeStr = isToday
        ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      emails.push({
        id: msg.id,
        from: fromName || 'Unknown',
        subject: getHeader('Subject') || '(no subject)',
        preview: (msgData.snippet || '').substring(0, 100),
        body: body,
        time: timeStr,
        unread: isUnread,
        account: 'gmail',
        tags: isUnread ? ['inbox'] : [],
        category: 'all'
      });
    }

    // Get unread count
    const unreadRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=INBOX&labelIds=UNREAD&maxResults=1',
      { headers: gHeaders }
    );
    const unreadData = await unreadRes.json();
    const unreadCount = unreadData.resultSizeEstimate || 0;

    res.status(200).json({
      connected: true,
      emails,
      unreadCount
    });
  } catch (err) {
    res.status(200).json({ connected: false, error: err.message });
  }
}
