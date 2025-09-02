// ===================================================================
// 🔧 إعدادات الديبج
// ===================================================================
const DEBUG = true; // خليها false لو عايز تطفي اللوجز كلها
const DATA_PATH = "../data/data1.json";

// Helpers للّوجز
const log = (...a) => DEBUG && console.log(...a);
const warn = (...a) => DEBUG && console.warn(...a);
const error = (...a) => DEBUG && console.error(...a);
const group = (label) => DEBUG && console.group(label);
const groupCollapsed = (label) => DEBUG && console.groupCollapsed(label);
const groupEnd = () => DEBUG && console.groupEnd();
const time = (label) => DEBUG && console.time(label);
const timeEnd = (label) => DEBUG && console.timeEnd(label);

// ✅ أول ما الصفحة تخلص تحميل، نستدعي الدالة الرئيسية
document.addEventListener("DOMContentLoaded", () => {
  log("📄 DOM جاهز — هنبدأ loadRequests()");
  loadRequests();
});

// ===================================================================
// 🟢 تحميل البيانات من ملف JSON وبدء توزيع الطلبات
// ===================================================================
async function loadRequests() {
  const TIMER = "⏱️ loadRequests";
  time(TIMER);
  groupCollapsed("🚀 بدء تحميل الداتا");

  try {
    log("📥 Fetch:", DATA_PATH);
    const res = await fetch(DATA_PATH);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} أثناء جلب ${DATA_PATH}`);
    }

    const data = await res.json();
    log("✅ JSON Parsed");
    groupCollapsed("👥 Employees (نظرة سريعة)");
    try {
      console.table?.(data.employees.slice(0, 5));
    } finally {
      groupEnd();
    }

    // 🟢 نخزن الموظفين في object بالـ id عشان نوصل لهم بسرعة
    const employees = {};
    data.employees.forEach((emp) => {
      employees[emp.id] = emp;
    });
    log(`🧭 تم فهرسة الموظفين: ${Object.keys(employees).length} موظف`);

    // 🟢 تقسيم الطلبات حسب النوع
    const lateRequests = data.requests.filter(
      (r) => r.type.toLowerCase() === "late"
    );
    const absenceRequests = data.requests.filter((r) =>
      ["absence", "leave"].includes(r.type.toLowerCase())
    );
    const overtimeRequests = data.requests.filter(
      (r) => r.type.toLowerCase() === "overtime"
    );
    const extensionRequests = data.requests.filter(
      (r) => r.type.toLowerCase() === "deadlineextension"
    );

    groupCollapsed("📊 إحصائيات سريعة للطلبات");
    log("Late:", lateRequests.length);
    log("Absence/Leave:", absenceRequests.length);
    log("Overtime:", overtimeRequests.length);
    log("DeadlineExtension:", extensionRequests.length);
    groupEnd();

    // 🟢 عرض الجداول
    renderLate(lateRequests, employees);
    renderAbsence(absenceRequests, employees);
    renderOvertime(overtimeRequests, employees);
    renderExtensions(extensionRequests, employees);

    log("🎉 تم عرض كل الجداول بنجاح");
  } catch (err) {
    error("❌ حصل خطأ أثناء تحميل البيانات:", err);
  } finally {
    groupEnd();
    timeEnd(TIMER);
  }
}

// ===================================================================
// 🟠 Late Requests (تأخير الحضور)
// ===================================================================
function renderLate(requests, employees) {
  const TIMER = "⏱️ renderLate";
  time(TIMER);
  groupCollapsed(`🟠 Render Late — عدد السجلات: ${requests.length}`);

  const tbody = document.querySelector("#late tbody");
  if (!tbody) {
    error("🚫 لم يتم العثور على #late tbody");
    groupEnd();
    timeEnd(TIMER);
    return;
  }

  tbody.innerHTML = "";
  requests.forEach((r, idx) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };

    // تحذيرات لو فيه قيم ناقصة
    if (!r.payload?.requestedDate)
      warn(`⚠️ [Late#${r.id}] requestedDate مفقودة`);
    if (r.payload?.minutesExpectedLate == null)
      warn(`⚠️ [Late#${r.id}] minutesExpectedLate مفقودة`);

    log(
      `→ Late#${r.id} (${idx + 1}/${requests.length}) | ${emp.name} | ${
        r.status
      }`
    );

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${r.payload?.requestedDate ?? "-"}</td>
        <td>09:00</td>
        <td>${formatActualIn(r.payload?.minutesExpectedLate)}</td>
        <td>${r.payload?.reason ?? "-"}</td>
        <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
        <td>${renderActions()}</td>
      </tr>
    `;
  });

  groupEnd();
  timeEnd(TIMER);
}

// ===================================================================
// 🟠 Absence Requests (غياب / إجازات)
// ===================================================================
function renderAbsence(requests, employees) {
  const TIMER = "⏱️ renderAbsence";
  time(TIMER);
  groupCollapsed(`🟠 Render Absence — عدد السجلات: ${requests.length}`);

  const tbody = document.querySelector("#absence tbody");
  if (!tbody) {
    error("🚫 لم يتم العثور على #absence tbody");
    groupEnd();
    timeEnd(TIMER);
    return;
  }

  tbody.innerHTML = "";
  requests.forEach((r, idx) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    log(
      `→ Absence#${r.id} (${idx + 1}/${requests.length}) | ${emp.name} | ${
        r.type
      } | ${r.status}`
    );

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${r.payload?.requestedDate ?? "-"}</td>
        <td>${r.type}</td>
        <td>${r.payload?.reason ?? "-"}</td>
        <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
        <td>${renderActions()}</td>
      </tr>
    `;
  });

  groupEnd();
  timeEnd(TIMER);
}

// ===================================================================
// 🟠 Overtime Requests (ساعات إضافية)
// ===================================================================
function renderOvertime(requests, employees) {
  const TIMER = "⏱️ renderOvertime";
  time(TIMER);
  groupCollapsed(`🟠 Render Overtime — عدد السجلات: ${requests.length}`);

  const tbody = document.querySelector("#overtime tbody");
  if (!tbody) {
    error("🚫 لم يتم العثور على #overtime tbody");
    groupEnd();
    timeEnd(TIMER);
    return;
  }

  tbody.innerHTML = "";
  requests.forEach((r, idx) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    log(
      `→ Overtime#${r.id} (${idx + 1}/${requests.length}) | ${emp.name} | ${
        r.payload?.overtimeHours ?? "-"
      }h | ${r.status}`
    );

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>${r.payload?.requestedDate ?? "-"}</td>
        <td>${r.payload?.overtimeHours ?? "-"} Hours</td>
        <td>${r.payload?.reason ?? "-"}</td>
        <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
        <td>${renderActions()}</td>
      </tr>
    `;
  });

  groupEnd();
  timeEnd(TIMER);
}

// ===================================================================
// 🟠 Extension Requests (تمديد المهام)
// ===================================================================
function renderExtensions(requests, employees) {
  const TIMER = "⏱️ renderExtensions";
  time(TIMER);
  groupCollapsed(`🟠 Render Extensions — عدد السجلات: ${requests.length}`);

  const tbody = document.querySelector("#extension tbody");
  if (!tbody) {
    error("🚫 لم يتم العثور على #extension tbody");
    groupEnd();
    timeEnd(TIMER);
    return;
  }

  tbody.innerHTML = "";
  requests.forEach((r, idx) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    log(
      `→ Extension#${r.id} (${idx + 1}/${requests.length}) | ${
        emp.name
      } | Task#${r.payload?.taskId ?? "-"} | ${r.status}`
    );

    tbody.innerHTML += `
      <tr>
        <td>${emp.name}</td>
        <td>Task #${r.payload?.taskId ?? "-"}</td>
        <td>--</td>
        <td>${r.payload?.requestedDate ?? "-"}</td>
        <td>${r.payload?.reason ?? "-"}</td>
        <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
        <td>${renderActions()}</td>
      </tr>
    `;
  });

  groupEnd();
  timeEnd(TIMER);
}

// ===================================================================
// 🟡 دوال مساعدة
// ===================================================================

// ✅ إرجاع اللون المناسب للحالة
function getStatusColor(status) {
  if (status === "Pending") return "warning"; // أصفر
  if (status === "Approved") return "success"; // أخضر
  return "danger"; // أحمر
}

// ✅ أزرار الإجراءات (قبول / رفض)
function renderActions() {
  return `
    <button class="btn btn-success btn-sm"><i class="fas fa-check"></i></button>
    <button class="btn btn-danger btn-sm"><i class="fas fa-times"></i></button>
  `;
}

// ✅ تنسيق وقت الدخول الفعلي بناءً على دقائق التأخير
function formatActualIn(minutes) {
  // لو الدقائق مش رقم، رجّع "-" مع تحذير
  if (minutes == null || isNaN(Number(minutes))) {
    warn("⚠️ minutesExpectedLate غير صالح:", minutes);
    return "-";
  }
  const mm = String(minutes).padStart(2, "0");
  return `09:${mm}`;
}
