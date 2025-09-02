console.log("📊 Team Attendance Dashboard");

// 🟢 Step 1: Load data from localStorage
const data = JSON.parse(localStorage.getItem("requestsState")) || {
  requests: [],
  employees: [],
};
const logs = JSON.parse(localStorage.getItem("actionLogs")) || [];

console.log("📦 Loaded requests:", data.requests);
console.log("📦 Loaded logs:", logs);

// 🟢 Step 2: Prepare employees list
const employees = {};
data.employees.forEach((emp) => {
  if (!employees[emp.name]) {
    employees[emp.name] = {
      name: emp.name,
      attendance: { Mon: "✔️", Tue: "✔️", Wed: "✔️", Thu: "✔️", Fri: "✔️" },
      stats: { present: 0, absent: 0, late: 0, leave: 0 },
    };
  }
});

// 🟢 Step 3: Apply logs to attendance
logs.forEach((log) => {
  const emp = employees[log.employee];
  if (!emp) return;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const day = days[log.requestId % 5]; // توزيع الأيام حسب الـ requestId

  if (log.newStatus === "Approved") {
    if (log.type === "Late") {
      emp.attendance[day] = "⏰";
    } else if (log.type === "Leave") {
      emp.attendance[day] = "🌴";
    }
  } else if (log.newStatus === "Rejected") {
    emp.attendance[day] = "❌";
  }
});

// 🟢 Step 4: Count stats
Object.values(employees).forEach((emp) => {
  Object.values(emp.attendance).forEach((status) => {
    switch (status) {
      case "✔️":
        emp.stats.present++;
        break;
      case "❌":
        emp.stats.absent++;
        break;
      case "⏰":
        emp.stats.late++;
        break;
      case "🌴":
        emp.stats.leave++;
        break;
    }
  });
});

// 🟢 Step 5: Render Heatmap Table
const heatmapBody = document.querySelector(".heatmap-table tbody");
heatmapBody.innerHTML = "";

Object.values(employees).forEach((emp) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${emp.name}</td>
    ${Object.values(emp.attendance)
      .map((s) => {
        if (s === "✔️") return `<td class="present"></td>`;
        if (s === "❌") return `<td class="absent"></td>`;
        if (s === "⏰") return `<td class="late"></td>`;
        if (s === "🌴") return `<td class="leave"></td>`;
        return `<td></td>`;
      })
      .join("")}
  `;
  heatmapBody.appendChild(row);
});

// 🟢 Step 6: Render Weekly Attendance Table
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

// 🟢 Step 7: Charts Data
const labels = Object.keys(employees);
const presentData = labels.map((name) => employees[name].stats.present);
const absentData = labels.map((name) => employees[name].stats.absent);
const lateData = labels.map((name) => employees[name].stats.late);
const leaveData = labels.map((name) => employees[name].stats.leave);

// Bar Chart
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
