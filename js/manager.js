import { loadData } from "./hr/dataService.js"

// ==========================
// 📌 Manager Dashboard Logic
// ==========================

// مفاتيح التخزين
const STORAGE_KEY = "requests";    // requests من localStorage
const LOGS_KEY = "actionLogs";     // اللوجز

let globalData = {}; // هنخزن فيه الموظفين + الطلبات

// ==========================
// 🟣 تحميل البيانات
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  const baseData = await loadData(); 
  const storedRequests = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // لو فيه requests في localStorage → نستخدمها
  baseData.requests = storedRequests.length > 0 ? storedRequests : baseData.requests;

  globalData = baseData; // نخزنه عشان نستعمله في اللوجز

  console.log("📦 الداتا النهائية:", globalData);

  renderAllTables(globalData);
  renderLogs();
});

// ==========================
// 🟣 رسم كل الجداول
// ==========================
function renderAllTables(data) {
  console.log("✅ تم توزيع الطلبات على الجداول");

  // تفريغ الجداول
  document.querySelectorAll("tbody").forEach((tbody) => (tbody.innerHTML = ""));

  data.requests.forEach((r) => {
    const emp = data.employees.find((e) => e.id === r.employeeId);
    if (!emp) return;

    const row = `
      <tr data-id="${r.id}">
        <td>${emp.name}</td>
        ${renderRequestRow(r)}
        <td><span class="badge bg-${getStatusColor(r.status)}">${r.status}</span></td>
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

// ==========================
// 🟣 يرسم أعمدة الطلب حسب نوعه
// ==========================
function renderRequestRow(r) {
  // خلي الـtype lowercase علشان نوحده
  const type = r.type?.toLowerCase();

  switch (type) {
    case "late":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.scheduledIn || "-"}</td>
        <td>${r.payload.actualIn || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "absence":
    case "leave":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.absenceType || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "overtime":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.overtimeHours || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "deadlineextension":
      return `
        <td>${r.payload.taskName || "-"}</td>
        <td>${r.payload.originalDeadline || "-"}</td>
        <td>${r.payload.requestedDate || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    case "wfh":
      return `
        <td>${r.payload.requestedDate || "-"}</td>
        <td>Week ${r.payload.weekIndex || "-"}</td>
        <td>${r.payload.reason || "-"}</td>
      `;

    default:
      return "<td colspan='4'>غير معروف</td>";
  }
}


// ==========================
// 🟣 التعامل مع الأكشنز Approve/Reject
// ==========================
function handleAction(requestId, newStatus) {
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

  // حول الـobject لقيم Array
  const requestsArray = Object.values(data);

  // دور على الريكوست
  const request = requestsArray.find((r) => r.id === requestId);

  if (request) {
    request.status = newStatus;
    request.decidedAt = new Date().toLocaleString();
    data[requestId] = request; // عدل النسخة الأصلية في object
  }

  // احفظ تاني
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  console.log(`⚡ Action: ${request?.employeeId} → ${newStatus}`);

  // سجل اللوج
  saveLog(request, newStatus);

  // إعادة رسم
  globalData.requests = requestsArray;
  renderAllTables(globalData);
  renderLogs();
}



// ==========================
// 🟣 اللوجز
// ==========================
function saveLog(request, newStatus) {
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY)) || [];
  const emp = globalData.employees.find((e) => e.id === request.employeeId);

  const log = {
    employee: emp ? emp.name : `ID-${request.employeeId}`,
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
        <td><span class="badge bg-${getStatusColor(log.newStatus)}">${log.newStatus}</span></td>
        <td>${log.date}</td>
      </tr>
    `;
  });
}

// ==========================
// 🟣 ألوان البادجات
// ==========================
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

// ==========================
// 🟣 Event Delegation
// ==========================
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

// ==========================
// 🟣 Theme Toggle (Dark/Light)
// ==========================
const toggleBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-theme");
  themeIcon.classList.remove("fa-moon");
  themeIcon.classList.add("fa-sun");
}

toggleBtn?.addEventListener("click", () => {
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
