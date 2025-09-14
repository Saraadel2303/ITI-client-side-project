console.log("📊 Team Attendance Dashboard");

const data = JSON.parse(localStorage.getItem("requestsState")) || {
  requests: [],
  employees: [],
};
const logs = JSON.parse(localStorage.getItem("actionLogs")) || [];

console.log("📦 Loaded requests:", data.requests);
console.log("📦 Loaded logs:", logs);

let latestLogs = Object.values(
  logs.reduce((acc, log) => {
    acc[log.requestId] = log;
    return acc;
  }, {})
);

console.log("📌 Latest logs only:", latestLogs);

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
  const day = days[log.requestId % 5]; // توزيع مؤقت حسب requestId

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

Object.values(employees).forEach((emp) => {
  Object.values(emp.attendance).forEach((status) => {
    switch (status) {
      case "🟩":
        emp.stats.present++;
        break;
      case "❌":
        emp.stats.absent++;
        break;
      case "🟨":
        emp.stats.late++;
        break;
      case "🟦":
        emp.stats.leave++;
        break;
    }
  });
});

const heatmapBody = document.querySelector(".heatmap-table tbody");
heatmapBody.innerHTML = "";

Object.values(employees).forEach((emp) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${emp.name}</td>
    ${Object.values(emp.attendance)
      .map((s) => {
        if (s === "🟩") return `<td class="present"></td>`;
        if (s === "❌") return `<td class="absent"></td>`;
        if (s === "🟨") return `<td class="late"></td>`;
        if (s === "🟦") return `<td class="leave"></td>`;
        return `<td></td>`;
      })
      .join("")}
  `;
  heatmapBody.appendChild(row);
});

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

const labels = Object.values(employees).map((e) => e.name);
const presentData = labels.map(
  (_, i) => Object.values(employees)[i].stats.present
);
const absentData = labels.map(
  (_, i) => Object.values(employees)[i].stats.absent
);
const lateData = labels.map((_, i) => Object.values(employees)[i].stats.late);
const leaveData = labels.map((_, i) => Object.values(employees)[i].stats.leave);

const ctxBar = document.getElementById("attendanceBarChart").getContext("2d");
new Chart(ctxBar, {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        label: "Present",
        data: presentData,
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Absent",
        data: absentData,
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
      {
        label: "Late",
        data: lateData,
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
      {
        label: "Leave",
        data: leaveData,
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  },
  options: { responsive: true, plugins: { legend: { position: "top" } } },
});

// 🟢 Step 8: Render Action Logs
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

// Pie Chart
const totalPresent = presentData.reduce((a, b) => a + b, 0);
const totalAbsent = absentData.reduce((a, b) => a + b, 0);
const totalLate = lateData.reduce((a, b) => a + b, 0);
const totalLeave = leaveData.reduce((a, b) => a + b, 0);

const ctxPie = document.getElementById("attendancePieChart").getContext("2d");
new Chart(ctxPie, {
  type: "pie",
  data: {
    labels: ["Present", "Absent", "Late", "Leave"],
    datasets: [
      {
        data: [totalPresent, totalAbsent, totalLate, totalLeave],
        backgroundColor: [
          "rgba(75, 192, 192, 0.7)",
          "rgba(255, 99, 132, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(54, 162, 235, 0.7)",
        ],
      },
    ],
  },
});

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
