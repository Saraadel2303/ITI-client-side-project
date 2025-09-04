import {
  getAttendanceTrend,
  getTasksStatusCount,
  getEmployeesByDepartment,
  getTopIdealEmployees,
} from "./hrUtils.js";

export async function renderHomeCharts() {
  const attendanceTrend = await getAttendanceTrend(7);

  const ctx = document.getElementById("attendanceChart").getContext("2d");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: attendanceTrend.map((d) => d.date),
      datasets: [
        {
          label: "Present",
          data: attendanceTrend.map((d) => d.present),
          borderColor: "#ff6b35",
          backgroundColor: "rgba(255, 107, 53, 0.2)",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Absent",
          data: attendanceTrend.map((d) => d.absent),
          borderColor: "#4bc0c0",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            colors: "#000000",
          },
        },
        x: {
          title: { display: true, text: "Date" },
        },
      },
    },
  });
}

// home page tasks chart
export async function renderTasksChart() {
  const taskCounts = await getTasksStatusCount();
  const colors = ["#534fea", "#4bc0c0", "#ff6b35"];

  const ctx = document.getElementById("tasksChart").getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Completed", "To Do", "In Progress"],
      datasets: [
        {
          data: [
            taskCounts.completed,
            taskCounts["To Do"],
            taskCounts["In Progress"],
          ],
          backgroundColor: colors,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "left",
          labels: { boxWidth: 12, padding: 20 },
        },
      },
    },
  });
}

// statistics page department chart
async function renderDeptChart() {
  const { labels, counts } = await getEmployeesByDepartment();
  const ctx = document.getElementById("deptChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,

      datasets: [
        {
          data: counts,
          backgroundColor: [
            "#534fea",
            "#6b65ff",
            "#9b8cff",
            "#ffc107",
            "#20c997",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

renderDeptChart();

// end department chart
// start ideal employees chart

async function renderIdealEmployeesChart() {
  const topEmployees = await getTopIdealEmployees();
  const labels = topEmployees.map((e) => e.name);
  const values = topEmployees.map((e) => e.score);

  const colors = labels.map((_, i) =>
    i === 0 ? "#fe6100ff" : ["#534fea", "#6b65ff", "#9b8cff"][i]
  );

  const ctx = document.getElementById("idealEmpChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Score (Higher is Better)",
          data: values,
          backgroundColor: colors,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw}`,
          },
        },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}
renderIdealEmployeesChart();
