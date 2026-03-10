# Sync Hub v3.1

Personal business command centre dashboard for Lee Wakeman.
Monitors 3 live businesses: LifeLink Sync, Vision-Sync Forge, AI Sales Sync.

**Live:** https://sync-hub-six.vercel.app

## Architecture

Single-file HTML/CSS/JS frontend with Vercel serverless API functions.

```
sync-hub/
├── index.html           <- Everything (CSS + HTML + JS in one file)
├── vercel.json          <- Deploy config, cron jobs, routing
├── manifest.json        <- PWA manifest
├── sw.js                <- Service worker (caching + push)
├── translate.html       <- Live translation page
├── api/
│   ├── chat.js          <- Claude AI chat proxy
│   ├── stripe.js        <- Stripe revenue data
│   ├── gmail.js         <- Gmail inbox sync
│   ├── health.js        <- App health monitor + SMS alerts
│   ├── sms.js           <- Twilio SMS send
│   ├── morning-digest.js <- Daily 07:00 UTC digest SMS
│   └── og.js            <- Open Graph image generation
└── assets/
    ├── favicon.svg
    └── icons/
        ├── icon-192.png
        └── icon-512.png
```

## Design System

- **Navy:** #0f1f3d | **Burgundy:** #8b1a2f | **Background:** #f4f6f9
- **Font:** Inter | **Radii:** 8px / 12px
- **App colours:** LifeLink #e84c6a | Vision-Sync #7c5cfc | AI Sales #0d9f6e

## Connect APIs

Add environment variables in Vercel dashboard (Settings > Environment Variables):

- `ANTHROPIC_API_KEY` - Activates AI assistant (Aria)
- `STRIPE_SECRET_KEY` - Live revenue data
- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` - Real inbox
- `TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_NUMBER`, `LEE_PHONE` - SMS alerts

## Deploy

```bash
git add . && git commit -m "message" && git push origin main
```

Auto-deploys via Vercel in ~20 seconds.

## Keyboard Shortcuts

- `Alt+1` Overview | `Alt+2` Emails | `Alt+3` Notifications
- `Alt+4` Reports | `Alt+5` Settings | `Alt+6` AI Assistant
