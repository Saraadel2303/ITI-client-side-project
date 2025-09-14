import { loadData } from "./dataService.js";
import { buildPayrollRows } from "./hrUtils.js";
export let cachedLates = [];
let currentPage = 1;
const pageSize = 5;
export async function fillTodayAttendanceTable() {
  const data = await loadData();
  const dataLocal = JSON.parse(localStorage.getItem("attendance")) || [];
  
  const today = new Date().toISOString().split("T")[0];
  const tbody = document.getElementById("attendance-table-body");
  tbody.innerHTML = "";

  cachedLates = (data.employees || []).map((emp) => {
    const record = (dataLocal || []).find(
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
    <button class="pagi" ${
      currentPage === 1 ? "disabled" : ""
    } id="prevPage"><<</button>
    <span class="mx-2">Page ${currentPage} of ${totalPages}</span>
    <button class="pagi" ${
      currentPage === totalPages ? "disabled" : ""
    } id="nextPage">>></button>
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
  const tbody = document.getElementById("attendance-table-body");
  if (filtered.length === 0 && query) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">NonExistent Employee("${query}")</td></tr>`;
  } else {
    renderTable(filtered, tbody);
  }
});


// payroll table
async function renderPayrollTable() {
  const rows = await buildPayrollRows();

  const tbody = document.getElementById("payrollTable");
  tbody.innerHTML = "";

  console.log(rows)
  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No payroll data found</td></tr>`;
    return;
  }
  let totalDeductions = 0;
  let totalBonus = 0;
  rows.forEach((row) => {
    totalDeductions += parseFloat(row.deductions) || 0;
    totalBonus += parseFloat(row.bonus) || 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.name}</td>
      <td>${row.baseSalary}</td>
      <td>${row.deductions}</td>
      <td>${row.bonus}</td>
      <td>${row.netSalary}</td>
    `;
    tbody.appendChild(tr);
  });
  document.querySelector("#totalDeductions").textContent =
    totalDeductions.toFixed(1);
  document.querySelector("#totalBonus").textContent = totalBonus.toFixed(1);
}
renderPayrollTable();
