// ==========================
// 📌 Manager Dashboard Logic
// ==========================

// مفاتيح التخزين
const STORAGE_KEY = "requestsState";
const LOGS_KEY = "actionLogs";

// ==========================
// 🟣 تحميل البيانات
// ==========================
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

// يرسم أعمدة الطلب حسب نوعه
function renderRequestRow(r) {
  switch (r.type) {
    case "Late":
      return `
        <td>${r.date}</td>
        <td>${r.scheduledIn}</td>
        <td>${r.actualIn}</td>
        <td>${r.reason}</td>
      `;
    case "Absence":
      return `
        <td>${r.dates}</td>
        <td>${r.absenceType}</td>
        <td>${r.reason}</td>
      `;
    case "Overtime":
      return `
        <td>${r.date}</td>
        <td>${r.hours}</td>
        <td>${r.reason}</td>
      `;
    case "Extension":
      return `
        <td>${r.taskName}</td>
        <td>${r.originalDeadline}</td>
        <td>${r.requestedExtension}</td>
        <td>${r.reason}</td>
      `;
    default:
      return "<td colspan='4'>غير معروف</td>";
  }
}

// ==========================
// 🟣 التعامل مع الأكشنز Approve/Reject
// ==========================
function handleAction(requestId, newStatus) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  // عدل حالة الطلب
  const request = data.requests.find((r) => r.id === requestId);
  if (request) {
    request.status = newStatus;
  }

  // احفظ النسخة المعدلة
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  console.log(`⚡ Action: ${request?.employeeId} → ${newStatus}`);

  // سجل في اللوج
  saveLog(request, newStatus);

  // إعادة رسم
  renderAllTables(data);
  renderLogs();
}

// ==========================
// 🟣 اللوجز
// ==========================
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
// 🟣 عند تشغيل الصفحة
// ==========================
document.addEventListener("DOMContentLoaded", loadRequests);
