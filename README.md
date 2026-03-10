# Sync Hub v3.0

A professional dashboard for managing health, family, notifications, emails, and more.

## Project Structure

```
sync-hub/
├── index.html              ← entry point
├── vercel.json             ← deploy to Vercel instantly
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── main.css        ← all styles
    └── js/
        ├── data.js         ← edit this to update metrics
        ├── components.js   ← sidebar, topbar, overview
        ├── emails.js       ← email panel
        ├── notifications.js
        ├── charts.js
        └── app.js          ← routing, clock, push
```

## Deploy

Push to GitHub and connect to Vercel, or run `vercel` from the project root.
