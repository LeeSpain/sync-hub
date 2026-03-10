// ─── Sync Hub — Charts ────────────────────────────────────────────────────────
// Uses Chart.js loaded via CDN in index.html

let chartInstances = {};

function renderCharts() {
  return `
    <section class="page" id="page-charts">
      <div class="charts-grid">
        <div class="chart-card">
          <h3>Heart Rate (7 days)</h3>
          <canvas id="chart-heartrate"></canvas>
        </div>
        <div class="chart-card">
          <h3>Steps (7 days)</h3>
          <canvas id="chart-steps"></canvas>
        </div>
        <div class="chart-card">
          <h3>Sleep (7 days)</h3>
          <canvas id="chart-sleep"></canvas>
        </div>
      </div>
    </section>`;
}

function initCharts() {
  const d = SyncData.chartData;
  const defaults = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f0f0f0" } } },
  };

  destroyCharts();

  chartInstances.heartRate = new Chart(document.getElementById("chart-heartrate"), {
    type: "line",
    data: {
      labels: d.labels,
      datasets: [{ data: d.heartRate, borderColor: "#ef4444", backgroundColor: "#fee2e2", fill: true, tension: 0.4 }],
    },
    options: defaults,
  });

  chartInstances.steps = new Chart(document.getElementById("chart-steps"), {
    type: "bar",
    data: {
      labels: d.labels,
      datasets: [{ data: d.steps, backgroundColor: "#3b82f6", borderRadius: 6 }],
    },
    options: defaults,
  });

  chartInstances.sleep = new Chart(document.getElementById("chart-sleep"), {
    type: "line",
    data: {
      labels: d.labels,
      datasets: [{ data: d.sleep, borderColor: "#8b5cf6", backgroundColor: "#ede9fe", fill: true, tension: 0.4 }],
    },
    options: defaults,
  });
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => c?.destroy());
  chartInstances = {};
}
