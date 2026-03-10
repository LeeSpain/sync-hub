// ─── Sync Hub — Email Panel ───────────────────────────────────────────────────

function renderEmails() {
  const tagColors = { health: "red", family: "blue", system: "gray" };

  return `
    <section class="page" id="page-emails">
      <div class="email-panel">
        <div class="email-toolbar">
          <span class="email-count">${SyncData.emails.length} messages</span>
          <div class="email-filters">
            <button class="filter-btn active" onclick="filterEmails('all', this)">All</button>
            <button class="filter-btn" onclick="filterEmails('health', this)">Health</button>
            <button class="filter-btn" onclick="filterEmails('family', this)">Family</button>
            <button class="filter-btn" onclick="filterEmails('system', this)">System</button>
          </div>
        </div>

        <div class="email-list" id="email-list">
          ${SyncData.emails.map(e => `
            <div class="email-row ${e.read ? "" : "unread"}" data-tag="${e.tag}" onclick="openEmail(${e.id})">
              <div class="email-avatar">${getInitials(e.from)}</div>
              <div class="email-body">
                <div class="email-from">${e.from}</div>
                <div class="email-subject">${e.subject}</div>
              </div>
              <div class="email-meta">
                <span class="email-time">${e.time}</span>
                <span class="email-tag tag-${tagColors[e.tag]}">${e.tag}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </section>`;
}

function filterEmails(tag, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  document.querySelectorAll(".email-row").forEach(row => {
    row.style.display = (tag === "all" || row.dataset.tag === tag) ? "" : "none";
  });
}

function openEmail(id) {
  const email = SyncData.emails.find(e => e.id === id);
  if (!email) return;
  email.read = true;
  alert(`From: ${email.from}\nSubject: ${email.subject}\n\n(Full email content would appear here.)`);
  document.querySelector(`[onclick="openEmail(${id})"]`)?.classList.remove("unread");
}
