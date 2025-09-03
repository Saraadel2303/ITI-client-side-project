import { loadData } from "./dataService.js";
export let cachedLates = [];
let currentPage = 1;
const pageSize = 5;
export async function fillTodayAttendanceTable() {
  const data = await loadData();
  const today = new Date().toISOString().split("T")[0];
  const tbody = document.getElementById("attendance-table-body");
  tbody.innerHTML = "";

  cachedLates = (data.employees || []).map((emp) => {
    const record = (data.attendanceRecords || []).find(
      (r) => r.employeeId === emp.id && r.date === today
    );

    const wfhRequest = (data.requests || []).find(
      (r) => r.employeeId === emp.id && r.date === today && r.type === "WFH"
    );

    let status = "No Record";
    let minutesLate = 0;

    if (wfhRequest) {
      status = "WFH";
    } else if (record) {
      status = record.status;
      if (record.status === "Late") {
        minutesLate = record.minutesLate;
      }
    }

    return {
      id: emp.id,
      name: emp.name,
      role: emp.role || "-",
      department: emp.department || "-",
      status,
      minutesLate,
    };
  });

  renderTable(cachedLates, tbody);
}
//attendace table
function renderTable(list, tbody) {
  tbody.innerHTML = "";
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = list.slice(start, end);

  pageItems.forEach((emp) => {
    const statusBadge =
      {
        Late: `<span class="badge bg-warning text-dark">Late (${emp.minutesLate} min)</span>`,
        Absent: `<span class="badge bg-danger">Absent</span>`,
        Present: `<span class="badge bg-success">Present</span>`,
        WFH: `<span class="badge bg-info text-dark">WFH</span>`,
        "No Record": `<span class="badge bg-secondary">No Record</span>`,
      }[emp.status] || `<span class="badge bg-secondary">${emp.status}</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.role}</td>
      <td>${emp.department}</td>
      <td>${statusBadge}</td>
    `;
    tbody.appendChild(row);
  });

  renderPagination(list.length);
}

//pagination
function renderPagination(totalItems) {
  const paginationDiv = document.getElementById("pagination");
  if (!paginationDiv) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  paginationDiv.innerHTML = `
    <button class="btn btn-sm btn-outline-primary" ${
      currentPage === 1 ? "disabled" : ""
    } id="prevPage">Previs</button>
    <span class="mx-2">Page ${currentPage} of ${totalPages}</span>
    <button class="btn btn-sm btn-outline-primary" ${
      currentPage === totalPages ? "disabled" : ""
    } id="nextPage">Next</button>
  `;

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable(
        cachedLates,
        document.getElementById("attendance-table-body")
      );
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTable(
        cachedLates,
        document.getElementById("attendance-table-body")
      );
    }
  });
}

// search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.trim().toLowerCase();

  let filtered;
  if (/^\d+$/.test(query)) {
    filtered = cachedLates.filter((emp) => String(emp.id) === query);
  } else {
    filtered = cachedLates.filter((emp) =>
      emp.name.toLowerCase().includes(query)
    );
  }
  currentPage = 1;
  renderTable(filtered, document.getElementById("attendance-table-body"));
});
// payroll table
async function renderPayroll() {
  const data = await loadData();
  const payrolls = data.payrolls || [];
  const employees = data.employees || [];

  let totalDeductions = 0;
  let totalBonus = 0;

  const tbody = document.getElementById("payrollTable");
  tbody.innerHTML = "";

  payrolls.forEach((p) => {
    const emp = employees.find((e) => e.id === p.employeeId);
    const empName = emp ? emp.name : "Unknown";

    totalDeductions += p.deductions;
    totalBonus += p.bonus;

    tbody.innerHTML += `
      <tr>
        <td> ${p.employeeId}-${empName}</td>
        <td>${p.month}</td>
        <td>${p.baseSalary.toLocaleString()} EGP</td>
        <td class="text-danger">-${p.deductions.toLocaleString()} EGP</td>
        <td class="text-success">+${p.bonus.toLocaleString()} EGP</td>
        <td><b>${p.netSalary.toLocaleString()} EGP</b></td>
      </tr>
    `;
  });

  document.getElementById(
    "totalDeductions"
  ).textContent = `-${totalDeductions.toLocaleString()} EGP`;
  document.getElementById(
    "totalBonus"
  ).textContent = `+${totalBonus.toLocaleString()} EGP`;
}

document.addEventListener("DOMContentLoaded", renderPayroll);
