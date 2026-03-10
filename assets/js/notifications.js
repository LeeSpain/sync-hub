// ─── Sync Hub — Notifications Panel ──────────────────────────────────────────

function renderNotifications() {
  const typeIcon = t => t === "health" ? "❤️" : t === "family" ? "👨‍👩‍👧" : "🔔";

  return `
    <section class="page" id="page-notifications">
      <div class="notif-panel">
        <div class="notif-toolbar">
          <span>${SyncData.notifications.filter(n => !n.read).length} unread</span>
          <button class="text-btn" onclick="markAllRead()">Mark all read</button>
        </div>

        <div class="notif-list" id="notif-list">
          ${SyncData.notifications.map(n => `
            <div class="notif-item ${n.read ? "" : "unread"}" id="notif-${n.id}" onclick="markRead(${n.id})">
              <span class="notif-icon">${typeIcon(n.type)}</span>
              <div class="notif-content">
                <div class="notif-message">${n.message}</div>
                <div class="notif-time">${n.time}</div>
              </div>
              ${!n.read ? `<span class="unread-dot"></span>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    </section>`;
}

function markRead(id) {
  const n = SyncData.notifications.find(x => x.id === id);
  if (!n || n.read) return;
  n.read = true;
  document.getElementById(`notif-${id}`)?.classList.remove("unread");
  document.querySelector(`notif-${id} .unread-dot`)?.remove();
  updateBadge();
}

function markAllRead() {
  SyncData.notifications.forEach(n => n.read = true);
  document.querySelectorAll(".notif-item").forEach(el => el.classList.remove("unread"));
  document.querySelectorAll(".unread-dot").forEach(el => el.remove());
  updateBadge();
}

function updateBadge() {
  const count = SyncData.notifications.filter(n => !n.read).length;
  const badge = document.querySelector('.nav-item[data-page="notifications"] .badge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "" : "none";
  }
}
