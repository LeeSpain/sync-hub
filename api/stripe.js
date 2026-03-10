export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(200).json({ connected: false, error: 'STRIPE_SECRET_KEY not set' });
  }

  try {
    const headers = {
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    // Get today's start timestamp (UTC)
    const now = new Date();
    const todayStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);

    // Fetch recent charges (last 7 days)
    const sevenDaysAgo = todayStart - (6 * 86400);
    const chargesRes = await fetch(
      'https://api.stripe.com/v1/charges?limit=100&created[gte]=' + sevenDaysAgo,
      { headers }
    );
    const chargesData = await chargesRes.json();

    if (chargesData.error) {
      return res.status(200).json({ connected: false, error: chargesData.error.message });
    }

    const charges = chargesData.data || [];

    // Today's revenue
    const todayCharges = charges.filter(c => c.created >= todayStart && c.status === 'succeeded');
    const todayRevenue = todayCharges.reduce((sum, c) => sum + c.amount, 0) / 100;

    // Last 7 days breakdown (Mon-Sun)
    const daily = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - (i * 86400);
      const dayEnd = dayStart + 86400;
      const dayCharges = charges.filter(c => c.created >= dayStart && c.created < dayEnd && c.status === 'succeeded');
      const dayTotal = dayCharges.reduce((sum, c) => sum + c.amount, 0) / 100;
      daily.push(dayTotal);
    }

    // Latest sale
    const latestSale = todayCharges.length > 0 ? {
      amount: todayCharges[0].amount / 100,
      description: todayCharges[0].description || 'Stripe payment',
      time: new Date(todayCharges[0].created * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    } : null;

    // Monthly revenue (current month)
    const monthStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
    const monthCharges = charges.filter(c => c.created >= monthStart && c.status === 'succeeded');
    const monthRevenue = monthCharges.reduce((sum, c) => sum + c.amount, 0) / 100;

    // Fetch balance
    const balRes = await fetch('https://api.stripe.com/v1/balance', { headers });
    const balData = await balRes.json();
    const balance = balData.available
      ? balData.available.reduce((sum, b) => sum + b.amount, 0) / 100
      : 0;

    res.status(200).json({
      connected: true,
      todayRevenue,
      monthRevenue,
      daily,
      latestSale,
      balance,
      totalChargesToday: todayCharges.length
    });
  } catch (err) {
    res.status(200).json({ connected: false, error: err.message });
  }
}
