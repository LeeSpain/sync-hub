// ─── Sync Hub — App Router & Init ────────────────────────────────────────────

const pages = {
  overview:      { title: "Overview",       render: renderOverview      },
  health:        { title: "Health",          render: renderHealth        },
  family:        { title: "Family",          render: renderFamily        },
  notifications: { title: "Notifications",   render: renderNotifications },
  emails:        { title: "Emails",          render: renderEmails        },
  charts:        { title: "Charts",          render: renderCharts        },
};

let currentPage = "overview";

function navigate(pageId) {
  if (!pages[pageId]) return;
  currentPage = pageId;
  renderApp();
}

function renderApp() {
  const page = pages[currentPage];
  const app = document.getElementById("app");

  app.innerHTML = renderSidebar() + `
    <div class="main-wrap">
      ${renderTopbar(page.title)}
      <main class="main-content">
        ${page.render()}
      </main>
    </div>`;

  // Highlight active nav item
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.page === currentPage);
  });

  // Re-init Lucide icons
  if (window.lucide) lucide.createIcons();

  // Init charts after DOM is ready
  if (currentPage === "charts") {
    requestAnimationFrame(initCharts);
  }

  startClock();
}

// ─── Clock ────────────────────────────────────────────────────────────────────
let clockInterval = null;

function startClock() {
  clearInterval(clockInterval);
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

function updateClock() {
  const el = document.getElementById("clock");
  if (el) el.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Sidebar toggle (mobile) ──────────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
function refreshDashboard() {
  renderApp();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => renderApp());
