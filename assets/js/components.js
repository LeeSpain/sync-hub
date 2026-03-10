// ─── Sync Hub — Sidebar, Topbar & Overview ───────────────────────────────────

function renderSidebar() {
  const nav = [
    { id: "overview",      icon: "grid",         label: "Overview"      },
    { id: "health",        icon: "activity",     label: "Health"        },
    { id: "family",        icon: "users",        label: "Family"        },
    { id: "notifications", icon: "bell",         label: "Notifications" },
    { id: "emails",        icon: "mail",         label: "Emails"        },
    { id: "charts",        icon: "bar-chart-2",  label: "Charts"        },
  ];

  const unread = SyncData.notifications.filter(n => !n.read).length;

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">⚡</div>
        <span class="brand-name">Sync Hub</span>
      </div>

      <nav class="sidebar-nav">
        ${nav.map(item => `
          <a href="#" class="nav-item" data-page="${item.id}" onclick="navigate('${item.id}');return false;">
            <i data-lucide="${item.icon}"></i>
            <span>${item.label}</span>
            ${item.id === "notifications" && unread > 0
              ? `<span class="badge">${unread}</span>`
              : ""}
          </a>
        `).join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="user-avatar">${getInitials(SyncData.user.name)}</div>
        <div class="user-info">
          <div class="user-name">${SyncData.user.name}</div>
          <div class="user-role">${SyncData.user.role}</div>
        </div>
      </div>
    </aside>`;
}

function renderTopbar(pageTitle) {
  return `
    <header class="topbar">
      <button class="menu-toggle" onclick="toggleSidebar()">
        <i data-lucide="menu"></i>
      </button>
      <h1 class="page-title">${pageTitle}</h1>
      <div class="topbar-right">
        <span class="clock" id="clock">--:--</span>
        <button class="icon-btn" title="Refresh" onclick="refreshDashboard()">
          <i data-lucide="refresh-cw"></i>
        </button>
      </div>
    </header>`;
}

function renderOverview() {
  const m = SyncData.metrics;
  const cards = [
    { label: "Heart Rate",  value: m.heartRate.value,  unit: m.heartRate.unit,  icon: "heart",       color: "red",    trend: m.heartRate.trend  },
    { label: "Steps",       value: m.steps.value.toLocaleString(), unit: m.steps.unit, icon: "footprints", color: "blue",  trend: m.steps.trend    },
    { label: "Sleep",       value: m.sleep.value,      unit: m.sleep.unit,      icon: "moon",        color: "purple", trend: m.sleep.trend      },
    { label: "Calories",    value: m.calories.value.toLocaleString(), unit: m.calories.unit, icon: "flame", color: "orange", trend: m.calories.trend },
    { label: "Hydration",   value: m.hydration.value,  unit: m.hydration.unit,  icon: "droplets",    color: "cyan",   trend: m.hydration.trend  },
    { label: "Weight",      value: m.weight.value,     unit: m.weight.unit,     icon: "scale",       color: "green",  trend: m.weight.trend     },
  ];

  const trendIcon = t => t === "up" ? "↑" : t === "down" ? "↓" : "→";

  return `
    <section class="page" id="page-overview">
      <div class="metrics-grid">
        ${cards.map(c => `
          <div class="metric-card color-${c.color}">
            <div class="metric-header">
              <i data-lucide="${c.icon}"></i>
              <span class="metric-trend trend-${c.trend}">${trendIcon(c.trend)}</span>
            </div>
            <div class="metric-value">${c.value}</div>
            <div class="metric-label">${c.label} <small>${c.unit}</small></div>
          </div>
        `).join("")}
      </div>

      <div class="overview-bottom">
        <div class="family-status-card">
          <h3>Family Status</h3>
          ${SyncData.family.map(f => `
            <div class="family-row">
              <div class="family-avatar ${f.status}">${getInitials(f.name)}</div>
              <div class="family-detail">
                <strong>${f.name}</strong> <span class="relation">${f.relation}</span>
                <div class="last-seen">Last seen: ${f.lastSeen}</div>
              </div>
              <span class="status-dot ${f.status}"></span>
            </div>
          `).join("")}
        </div>

        <div class="recent-notifications-card">
          <h3>Recent Alerts</h3>
          ${SyncData.notifications.slice(0, 3).map(n => `
            <div class="notif-row ${n.read ? "" : "unread"}">
              <span class="notif-type-icon type-${n.type}">
                ${n.type === "health" ? "❤️" : n.type === "family" ? "👨‍👩‍👧" : "🔔"}
              </span>
              <div class="notif-text">
                <div>${n.message}</div>
                <small>${n.time}</small>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>`;
}

function renderHealth() {
  const m = SyncData.metrics;
  return `
    <section class="page" id="page-health">
      <div class="health-grid">
        ${Object.entries(m).map(([key, v]) => `
          <div class="health-card">
            <div class="health-label">${capitalize(key.replace(/([A-Z])/g, " $1"))}</div>
            <div class="health-value">${typeof v.value === "number" ? v.value.toLocaleString() : v.value}
              <span class="health-unit">${v.unit}</span>
            </div>
            <div class="health-bar-wrap">
              <div class="health-bar" style="width:${Math.min(100, (v.value / getMax(key)) * 100)}%"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </section>`;
}

function renderFamily() {
  return `
    <section class="page" id="page-family">
      <div class="family-grid">
        ${SyncData.family.map(f => `
          <div class="family-card">
            <div class="family-card-avatar ${f.status}">${getInitials(f.name)}</div>
            <h3>${f.name}</h3>
            <div class="family-card-relation">${f.relation} · Age ${f.age}</div>
            <div class="family-card-status status-${f.status}">${capitalize(f.status)}</div>
            <div class="family-card-seen">Last seen: ${f.lastSeen}</div>
          </div>
        `).join("")}
      </div>
    </section>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getMax(key) {
  const maxes = { heartRate: 200, steps: 15000, sleep: 10, calories: 3000, hydration: 10, weight: 150 };
  return maxes[key] || 100;
}
