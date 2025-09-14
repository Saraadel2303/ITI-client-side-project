const STORAGE_KEY = "requestsState";
const LOGS_KEY = "actionLogs";

async function loadRequests() {
  console.log("🔄 جاري تحميل البيانات ...");

  let data;
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    console.log("📦 جبت الداتا من localStorage");
    data = JSON.parse(saved);
  } else {
    const res = await fetch("../data/data1.json");
    data = await res.json();
    console.log("✅ البيانات اتجابت:", data);

    // خزنها أول مرة
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  renderAllTables(data);
  renderLogs();
}

function renderAllTables(data) {
  console.log("✅ تم توزيع الطلبات على الجداول");

  document.querySelectorAll("tbody").forEach((tbody) => (tbody.innerHTML = ""));

  data.requests.forEach((r) => {
    const emp = data.employees.find((e) => e.id === r.employeeId);
    if (!emp) return;

    const row = `
      <tr data-id="${r.id}">
        <td>${emp.name}</td>
        ${renderRequestRow(r)}
        <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
        <td>
          <button class="btn btn-success btn-sm btn-approve"><i class="fas fa-check"></i></button>
          <button class="btn btn-danger btn-sm btn-reject"><i class="fas fa-times"></i></button>
        </td>
      </tr>
    `;

    const tbody = document.querySelector(`#${r.type.toLowerCase()} tbody`);
    if (tbody) tbody.innerHTML += row;
  });
}

function renderRequestRow(r) {
  switch (r.type) {
    case "Late":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.scheduledIn || "-"}</td>
        <td>${r.payload.actualIn || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "Absence":
    case "leave":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.absenceType || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "Overtime":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.overtimeHours || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "DeadlineExtension":
      return `
        <td>${r.payload.taskName || "-"}</td>
        <td>${r.payload.originalDeadline || "-"}</td>
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "WFH":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>Week ${r.payload.weekIndex || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    default:
      return "<td colspan='4'>غير معروف</td>";
  }
}

function handleAction(requestId, newStatus) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  const request = data.requests.find((r) => r.id === requestId);
  if (request) {
    request.status = newStatus;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log(`⚡ Action: ${request?.employeeId} → ${newStatus}`);

  saveLog(request, newStatus);
  renderAllTables(data);
  renderLogs();
}

function saveLog(request, newStatus) {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY)) || [];
  const log = {
    employee: request.employeeId,
    requestId: request.id,
    type: request.type,
    newStatus,
    date: new Date().toLocaleString(),
  };
  logs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  console.log("💾 تم حفظ اللوج:", logs);
}

function renderLogs() {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY)) || [];
  const tbody = document.querySelector("#logs-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  logs.forEach((log, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${log.employee}</td>
        <td>${log.requestId}</td>
        <td>${log.type}</td>
        <td><span class="badge bg-${getStatusColor(log.newStatus)}">${
      log.newStatus
    }</span></td>
        <td>${log.date}</td>
      </tr>
    `;
  });
}

function getStatusColor(status) {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "danger";
    default:
      return "secondary";
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest(".btn-approve")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.dataset.id);
    handleAction(id, "Approved");
  }

  if (e.target.closest(".btn-reject")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.dataset.id);
    handleAction(id, "Rejected");
  }
});

document.addEventListener("DOMContentLoaded", loadRequests);

const toggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-theme");
  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
    localStorage.setItem("theme", "dark");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
    localStorage.setItem("theme", "light");
  }
});
