// Vercel Edge Function — Claude AI chat proxy
// Requires ANTHROPIC_API_KEY in Vercel environment variables

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' });
  }

  try {
    const body = req.body;

    // Memory extraction mode
    if (body.extract_memories) {
      const extractReply = await callClaude(apiKey, [{
        role: 'user',
        content: `Review this conversation and extract any facts worth remembering long-term about the user (Lee Wakeman, UK entrepreneur running 3 AI businesses). Only save genuinely useful, non-obvious information. Return a JSON array of objects with fields: memory_type (fact|preference|decision|reminder|business|personal), content (one clear sentence), importance (1-10). Return empty array [] if nothing worth saving.\n\nUser said: "${body.user_message}"\nAssistant replied: "${body.ai_reply}"\n\nRespond with ONLY the JSON array, no other text.`
      }], 'You are a memory extraction system. Only output valid JSON arrays.');

      try {
        const memories = JSON.parse(extractReply);
        return res.status(200).json({ memories: Array.isArray(memories) ? memories : [] });
      } catch {
        return res.status(200).json({ memories: [] });
      }
    }

    // Normal chat mode
    const config = body.config || {};
    const messages = body.messages || [];
    const memories = body.memories || [];

    const name = config.assistant_name || 'Aria';
    const personalityKey = config.personality || 'professional_friendly';
    const personalities = {
      professional_friendly: 'Professional but warm. Efficient and clear. Occasionally light humour.',
      direct: 'Extremely direct. Bullet points. No small talk. Just the facts.',
      friendly: 'Warm, conversational, encouraging. Like a trusted friend who knows your business.',
      formal: 'Formal and precise. Executive assistant style. Highly structured responses.',
      custom: config.system_prompt_override || ''
    };

    const personality = personalityKey === 'custom'
      ? (config.system_prompt_override || personalities.professional_friendly)
      : (personalities[personalityKey] || personalities.professional_friendly);

    const memoryText = memories.length
      ? memories.map(m => `- [${m.memory_type}] ${m.content}`).join('\n')
      : 'No memories stored yet — this is a new relationship.';

    const systemPrompt = config.system_prompt_override && personalityKey !== 'custom'
      ? config.system_prompt_override
      : `You are ${name}, Lee Wakeman's personal AI assistant.

PERSONALITY: ${personality}

ABOUT LEE:
- UK-based entrepreneur running 3 AI businesses
- LifeLink Sync (lifelink-sync.com) — Emergency Protection & AI Safety
- Vision-Sync Forge (vision-sync.co) — AI Agents, Chatbots & Automation
- AI Sales Sync (aisales-sync.com) — AI-Powered Sales Automation
- Uses British English, GBP for currency, DD/MM/YYYY dates
- This is his personal command centre dashboard — be direct, no fluff

LONG-TERM MEMORY — things you remember about Lee:
${memoryText}

RESPONSE STYLE:
- Keep responses concise and natural (2-4 sentences unless asked for more)
- Be direct — Lee is busy, value his time
- Never say "As an AI" or add unnecessary caveats
- Use British English throughout
- If you don't know something, say so honestly`;

    // Gather live business context
    let businessContext = '';
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const sHeaders = { 'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY };
        const now = new Date();
        const todayStart = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
        const chargesRes = await fetch('https://api.stripe.com/v1/charges?limit=50&created[gte]=' + todayStart, { headers: sHeaders });
        const chargesData = await chargesRes.json();
        if (chargesData.data) {
          const charges = chargesData.data.filter(c => c.status === 'succeeded');
          const total = charges.reduce((s, c) => s + c.amount, 0) / 100;
          businessContext += '\n\nLIVE STRIPE DATA (real-time):\n- Revenue today: \u00a3' + total.toLocaleString('en-GB');
          businessContext += '\n- Transactions today: ' + charges.length;
          if (charges[0]) businessContext += '\n- Latest sale: \u00a3' + (charges[0].amount / 100) + ' at ' + new Date(charges[0].created * 1000).toLocaleTimeString('en-GB');
        }
      }
    } catch (e) { /* Stripe unavailable */ }

    try {
      const apps = [
        { name: 'LifeLink Sync', url: 'https://www.lifelink-sync.com/' },
        { name: 'Vision-Sync Forge', url: 'https://www.vision-sync.co/' },
        { name: 'AI Sales Sync', url: 'https://www.aisales-sync.com/' }
      ];
      const healthResults = [];
      for (const app of apps) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          const r = await fetch(app.url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
          clearTimeout(timeout);
          healthResults.push(app.name + ': ' + (r.ok ? 'Online' : 'Issue'));
        } catch (e) { healthResults.push(app.name + ': DOWN'); }
      }
      businessContext += '\n\nAPP HEALTH (live):\n- ' + healthResults.join('\n- ');
    } catch (e) { /* Health unavailable */ }

    const fullSystem = systemPrompt + businessContext;
    const reply = await callClaude(apiKey, messages, fullSystem);
    return res.status(200).json({ connected: true, reply });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(200).json({ connected: false, error: 'Failed to get response from Claude' });
  }
}

async function callClaude(apiKey, messages, system) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: system,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
