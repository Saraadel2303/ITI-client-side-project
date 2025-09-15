console.log("📊 Team Attendance Dashboard");

const data = JSON.parse(localStorage.getItem("requestsState")) || {
  requests: [],
  employees: [],
};
const logs = JSON.parse(localStorage.getItem("actionLogs")) || [];

let latestLogs = Object.values(
  logs.reduce((acc, log) => {
    acc[log.requestId] = log;
    return acc;
  }, {})
);

const employees = {};
data.employees.forEach((emp) => {
  if (!employees[emp.id]) {
    employees[emp.id] = {
      name: emp.name,
      attendance: { Mon: "🟩", Tue: "🟩", Wed: "🟩", Thu: "🟩", Fri: "🟩" },
      stats: { present: 0, absent: 0, late: 0, leave: 0 },
    };
  }
});

latestLogs.forEach((log) => {
  const emp = employees[log.employee];
  if (!emp) return;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const day = days[log.requestId % 5];

  if (log.newStatus === "Approved") {
    if (log.type === "Late") {
      emp.attendance[day] = "🟨";
    } else if (log.type === "Leave" || log.type === "Absence") {
      emp.attendance[day] = "🟦";
    }
  } else if (log.newStatus === "Rejected") {
    emp.attendance[day] = "❌";
  }
});

// 🟢 Render Heatmap
// const heatmapBody = document.querySelector(".heatmap-table tbody");
// heatmapBody.innerHTML = "";

// Object.values(employees).forEach((emp) => {
//   const row = document.createElement("tr");
//   row.innerHTML = `
//     <td>${emp.name}</td>
//     ${Object.values(emp.attendance)
//       .map((s) => {
//         if (s === "🟩") return `<td class="present"></td>`;
//         if (s === "❌") return `<td class="absent"></td>`;
//         if (s === "🟨") return `<td class="late"></td>`;
//         if (s === "🟦") return `<td class="leave"></td>`;
//         return `<td></td>`;
//       })
//       .join("")}
//   `;
//   heatmapBody.appendChild(row);
// });

// 🟢 Render Weekly Table
const weeklyBody = document.querySelector("section.card-container table tbody");
weeklyBody.innerHTML = "";

Object.values(employees).forEach((emp) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${emp.name}</td>
    ${Object.values(emp.attendance)
      .map((s) => `<td>${s}</td>`)
      .join("")}
  `;
  weeklyBody.appendChild(row);
});

// 🟢 Render Action Logs
const logsTableBody = document.querySelector(".action-logs-table tbody");
logsTableBody.innerHTML = "";

logs.forEach((log, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${log.employee}</td>
    <td>${log.type}</td>
    <td>
      <span class="badge ${
        log.newStatus === "Approved" ? "bg-success" : "bg-danger"
      }">${log.newStatus}</span>
    </td>
    <td>${log.date}</td>
  `;
  logsTableBody.appendChild(row);
});

// 🟢 Theme toggle
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeIcon.classList.replace("fa-moon", "fa-sun");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
      themeIcon.classList.replace("fa-moon", "fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      themeIcon.classList.replace("fa-sun", "fa-moon");
      localStorage.setItem("theme", "light");
    }
  });
});