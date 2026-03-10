// Vercel Serverless Function — Dynamic OG Image Generator
// Serves as /api/og — returns a 1200x630 PNG social preview image

export default async function handler(req, res) {
  const title = req.query.title || 'Sync Hub';
  const subtitle = req.query.subtitle || 'Personal Business Command Centre';

  // Generate SVG-based OG image (1200x630)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0f1f3d"/>
        <stop offset="100%" style="stop-color:#162040"/>
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>
    <!-- Subtle grid pattern -->
    <g opacity="0.04" stroke="#fff" stroke-width="1">
      ${Array.from({length: 20}, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="630"/>`).join('')}
      ${Array.from({length: 11}, (_, i) => `<line x1="0" y1="${i * 60}" x2="1200" y2="${i * 60}"/>`).join('')}
    </g>
    <!-- Accent line top -->
    <rect x="0" y="0" width="1200" height="4" fill="#8b1a2f"/>
    <!-- Brand mark -->
    <g transform="translate(80,240)">
      <rect width="56" height="56" rx="12" fill="#8b1a2f"/>
      <g transform="translate(28,28)">
        <path d="M-8,-12 A16,16 0 0,1 12,-4" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        <path d="M8,12 A16,16 0 0,1 -12,4" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="3" fill="#fff"/>
      </g>
    </g>
    <!-- Title -->
    <text x="160" y="265" font-family="Inter,system-ui,sans-serif" font-size="48" font-weight="700" fill="#ffffff" letter-spacing="-0.02em">${escapeXml(title)}</text>
    <!-- Subtitle -->
    <text x="160" y="305" font-family="Inter,system-ui,sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.55)">${escapeXml(subtitle)}</text>
    <!-- App indicators -->
    <g transform="translate(80,420)">
      <circle cx="8" cy="8" r="6" fill="#e84c6a"/>
      <text x="22" y="13" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="500" fill="rgba(255,255,255,0.6)">LifeLink Sync</text>
      <circle cx="188" cy="8" r="6" fill="#7c5cfc"/>
      <text x="202" y="13" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="500" fill="rgba(255,255,255,0.6)">Vision-Sync Forge</text>
      <circle cx="398" cy="8" r="6" fill="#0d9f6e"/>
      <text x="412" y="13" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="500" fill="rgba(255,255,255,0.6)">AI Sales Sync</text>
    </g>
    <!-- Bottom bar -->
    <rect x="0" y="580" width="1200" height="50" fill="rgba(0,0,0,0.2)"/>
    <text x="80" y="610" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="500" fill="rgba(255,255,255,0.4)">sync-hub-six.vercel.app</text>
    <!-- AI badge -->
    <rect x="1020" y="592" width="100" height="26" rx="13" fill="rgba(124,92,252,0.2)" stroke="rgba(124,92,252,0.3)" stroke-width="1"/>
    <text x="1045" y="610" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="600" fill="#7c5cfc">AI Powered</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.status(200).send(svg);
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
