document.addEventListener("DOMContentLoaded", loadRequests);

async function loadRequests() {
  try {
    const res = await fetch("../data/data1.json");
    const data = await res.json();

    // 🟢 نخزن الموظفين بالـ id
    const employees = {};
    data.employees.forEach((emp) => {
      employees[emp.id] = emp;
    });

    // 🟢 تقسيم الطلبات
    renderLate(
      data.requests.filter((r) => r.type.toLowerCase() === "late"),
      employees
    );
    renderAbsence(
      data.requests.filter((r) =>
        ["absence", "leave"].includes(r.type.toLowerCase())
      ),
      employees
    );
    renderOvertime(
      data.requests.filter((r) => r.type.toLowerCase() === "overtime"),
      employees
    );
    renderExtensions(
      data.requests.filter((r) => r.type.toLowerCase() === "deadlineextension"),
      employees
    );
  } catch (err) {
    console.error("Error loading data:", err);
  }
}

function renderLate(requests, employees) {
  const tbody = document.querySelector("#late tbody");
  tbody.innerHTML = "";
  requests.forEach((r) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    tbody.innerHTML += `
        <tr>
          <td>${emp.name}</td>
          <td>${r.payload.requestedDate}</td>
          <td>09:00</td>
          <td>09:${r.payload.minutesExpectedLate}</td>
          <td>${r.payload.reason}</td>
          <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
          <td>${renderActions()}</td>
        </tr>
      `;
  });
}

function renderAbsence(requests, employees) {
  const tbody = document.querySelector("#absence tbody");
  tbody.innerHTML = "";
  requests.forEach((r) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    tbody.innerHTML += `
        <tr>
          <td>${emp.name}</td>
          <td>${r.payload.requestedDate}</td>
          <td>${r.type}</td>
          <td>${r.payload.reason}</td>
          <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
          <td>${renderActions()}</td>
        </tr>
      `;
  });
}

function renderOvertime(requests, employees) {
  const tbody = document.querySelector("#overtime tbody");
  tbody.innerHTML = "";
  requests.forEach((r) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    tbody.innerHTML += `
        <tr>
          <td>${emp.name}</td>
          <td>${r.payload.requestedDate}</td>
          <td>${r.payload.overtimeHours || "-"} Hours</td>
          <td>${r.payload.reason}</td>
          <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
          <td>${renderActions()}</td>
        </tr>
      `;
  });
}

function renderExtensions(requests, employees) {
  const tbody = document.querySelector("#extension tbody");
  tbody.innerHTML = "";
  requests.forEach((r) => {
    const emp = employees[r.employeeId] || { name: "Unknown" };
    tbody.innerHTML += `
        <tr>
          <td>${emp.name}</td>
          <td>Task #${r.payload.taskId || "-"}</td>
          <td>--</td>
          <td>${r.payload.requestedDate}</td>
          <td>${r.payload.reason}</td>
          <td><span class="badge bg-${getStatusColor(r.status)}">${
      r.status
    }</span></td>
          <td>${renderActions()}</td>
        </tr>
      `;
  });
}

function getStatusColor(status) {
  if (status === "Pending") return "warning";
  if (status === "Approved") return "success";
  return "danger";
}

function renderActions() {
  return `
      <button class="btn btn-success btn-sm"><i class="fas fa-check"></i></button>
      <button class="btn btn-danger btn-sm"><i class="fas fa-times"></i></button>
    `;
}
