// ─── Sync Hub — Data Layer ───────────────────────────────────────────────────
// Edit this file to update metrics, family members, and alerts shown in the UI.

const SyncData = {
  user: {
    name: "Lee Wakeman",
    avatar: null, // set to image URL or null for initials
    role: "Admin",
  },

  metrics: {
    heartRate: { value: 72, unit: "bpm", trend: "stable" },
    steps: { value: 8_420, unit: "steps", trend: "up" },
    sleep: { value: 7.2, unit: "hrs", trend: "down" },
    calories: { value: 1_840, unit: "kcal", trend: "up" },
    hydration: { value: 6, unit: "glasses", trend: "stable" },
    weight: { value: 78.5, unit: "kg", trend: "stable" },
  },

  family: [
    { id: 1, name: "Emma", relation: "Daughter", age: 14, status: "active", lastSeen: "2 min ago" },
    { id: 2, name: "Jake",  relation: "Son",      age: 11, status: "active", lastSeen: "5 min ago" },
    { id: 3, name: "Sarah", relation: "Partner",  age: 41, status: "away",   lastSeen: "1 hr ago" },
  ],

  notifications: [
    { id: 1, type: "health",  message: "Heart rate spike detected at 09:14",     time: "9 min ago",  read: false },
    { id: 2, type: "family",  message: "Emma arrived at school",                  time: "42 min ago", read: false },
    { id: 3, type: "system",  message: "Weekly health report is ready",           time: "2 hrs ago",  read: true  },
    { id: 4, type: "family",  message: "Jake completed his homework reminder",    time: "3 hrs ago",  read: true  },
    { id: 5, type: "health",  message: "You hit your daily step goal!",           time: "Yesterday",  read: true  },
  ],

  emails: [
    { id: 1, from: "Dr. Patel",        subject: "Blood results — all clear",         time: "08:30", read: false, tag: "health"  },
    { id: 2, from: "School Admin",     subject: "End-of-term report available",       time: "07:15", read: false, tag: "family"  },
    { id: 3, from: "Vercel",           subject: "Deployment succeeded",               time: "Yesterday", read: true, tag: "system" },
    { id: 4, from: "Apple Health",     subject: "Your weekly summary",                time: "Mon",   read: true,  tag: "health"  },
    { id: 5, from: "Jake",             subject: "Can we get pizza tonight? 🍕",       time: "Sun",   read: true,  tag: "family"  },
  ],

  chartData: {
    heartRate: [68, 72, 75, 71, 69, 74, 72],
    steps:     [6200, 7800, 5400, 9100, 8200, 7600, 8420],
    sleep:     [6.5, 7.1, 8.0, 7.4, 6.8, 7.2, 7.2],
    labels:    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"],
  },
};
