// import functions
import {
  getEmpCount,
  getPresntsToday,
  getAbsentCount,
  getLateTasksCount,
  getDepartmentCount,
  getAvgAttendance,
  getEmployeesPerDeptAvg,
  getAvgAttendancePerDept,
  getIdealEmployee,
} from "./hrUtils.js";

import { renderHomeCharts, renderTasksChart } from "./charts.js";
import { fillTodayAttendanceTable } from "./tables.js";

// dark\light mode toggle
document.getElementById("toggleThemeBtnLight").addEventListener("click", () => {
  document.body.classList.remove("dark-theme");
});
document.getElementById("toggleThemeBtnDark").addEventListener("click", () => {
  document.body.classList.add("dark-theme");
});
// #################################

//  hr dashboard routing
const links = document.querySelectorAll(".mynav a");
const sections = document.querySelectorAll(".page-section");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    sections.forEach((section) => section.classList.add("d-none"));

    const route = link.getAttribute("data-route");
    document.getElementById(route).classList.remove("d-none");
  });
});
//  end routing
// #################################

// #########################################
// start home content
// #########################################
// logout button
const logedusername = document.getElementById("logedusername");
const user = JSON.parse(localStorage.getItem("loggedInUser"));
logedusername.textContent = ` ${user} `;

document.querySelector(".logout").addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");

  window.location.replace("login.html");
});

// start over view
async function fillHRDashboard() {
  const empCount = await getEmpCount();
  const PresentsToday = await getPresntsToday();
  const absentCount = await getAbsentCount();

  const lateTasksCount = await getLateTasksCount();

  document.querySelector(".total").textContent = empCount;
  document.querySelector(".present").textContent = PresentsToday;
  document.querySelector(".absences").textContent = absentCount;
  document.querySelector(".tasks").textContent = lateTasksCount;
}

fillHRDashboard();
// end over view

// start Home page charts
renderHomeCharts();
renderTasksChart();
// end home page charts

// start table home page
fillTodayAttendanceTable();
// end table home page

// #########################################
// end home content
// #########################################

// #########################################
// start statistics content
// #########################################

async function fillStatisticsDashboard() {
  const depCount = await getDepartmentCount();
  const avgAttendance = await getAvgAttendance();
  const empAvgDep = await getEmployeesPerDeptAvg();

  document.querySelector(".deprtments").textContent = depCount;
  document.querySelector(".avg").textContent = avgAttendance + "%";
  document.querySelector(".emp-dept").textContent = empAvgDep + "%";
}

fillStatisticsDashboard();

async function renderAttendanceBars() {
  const { labels, values } = await getAvgAttendancePerDept();
  const container = document.getElementById("attendanceBars");

  container.innerHTML = "";
  labels.forEach((dept, i) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("attendance-bar");

    wrapper.innerHTML = `
      <div class="attendance-label">${dept} - ${values[i]}%</div>
      <div class="progress d-flex">
        <div class="progress-bar " role="progressbar" 
             style="width: ${values[i]}%" 
             aria-valuenow="${values[i]}" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
    `;
    container.appendChild(wrapper);
  });
}

renderAttendanceBars();

// #########################################
// end statistics content
// #########################################

// Settings page
document.getElementById("settingsForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const penalty_30 = +document.getElementById("penalty_30").value;
  const penalty_60 = +document.getElementById("penalty_60").value;
  const penalty_120 = +document.getElementById("penalty_120").value;
  const cap = +document.getElementById("cap").value;
  const weekday_mult = +document.getElementById("weekday_mult").value;
  const weekend_mult = +document.getElementById("weekend_mult").value;
  const ideal_bonus = +document.getElementById("ideal_bonus").value;


  if (
    penalty_30 < 0 ||
    penalty_60 < 0 ||
    penalty_120 < 0 ||
    cap < 0 ||
    weekday_mult < 0 ||
    weekend_mult < 0 ||
    ideal_bonus < 0
  ) {
    Swal.fire({
      title: "Error",
      text: "You can't Enter a Negative Number In Inbut Field",
      icon: "error",
      confirmButtonText: "Ok",
      confirmButtonColor: "#534fea",
    });
    return;
  }

  const settings = {
    penalties: {
      "16_30": penalty_30,
      "31_60": penalty_60,
      "61_120": penalty_120,
      cap: cap,
    },
    overtime: {
      policy: document.getElementById("overtime_policy").value,
      weekday: weekday_mult,
      weekend: weekend_mult,
    },
    ideal: {
      bonus: ideal_bonus,
      badge: document.getElementById("ideal_badge").value,
    },
  };

  localStorage.setItem("settings", JSON.stringify(settings));

  Swal.fire({
    title: " Settings Saved!",
    text: "Your changes have been saved successfully.",
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#534fea",
  });
});
// settings load
function loadSettings() {
  const saved = JSON.parse(localStorage.getItem("settings"));
  if (!saved) return;

  document.getElementById("penalty_30").value = saved.penalties["16_30"];
  document.getElementById("penalty_60").value = saved.penalties["31_60"];
  document.getElementById("penalty_120").value = saved.penalties["61_120"];
  document.getElementById("cap").value = saved.penalties.cap;

  document.getElementById("overtime_policy").value = saved.overtime.policy;
  document.getElementById("weekday_mult").value = saved.overtime.weekday;
  document.getElementById("weekend_mult").value = saved.overtime.weekend;

  document.getElementById("ideal_bonus").value = saved.ideal.bonus;
  document.getElementById("ideal_badge").value = saved.ideal.badge;
}

document.addEventListener("DOMContentLoaded", loadSettings);
// export payroll to excel
document.querySelector(".export").addEventListener("click", () => {
  const table = document.querySelector(".payroll-table");
  if (!table) return;

  const today = new Date().toISOString().split("T")[0];
  const sheetName = `Payroll Impact (${today})`;

  const wb = XLSX.utils.table_to_book(table, { sheet: sheetName });

  const ws = wb.Sheets[sheetName];
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "007bff" } },
        alignment: { horizontal: "center" },
      };
    }
  }

  XLSX.writeFile(wb, `payroll_impact_${today}.xlsx`);
});

// ideal employees page
async function renderIdealEmployee() {
  const emp = await getIdealEmployee();
  const bouns = JSON.parse(localStorage.getItem("settings"))?.ideal?.bonus || 0;

  if (emp) {
    document.getElementById("idealName").textContent = emp.name;
    document.getElementById(
      "idealStats"
    ).textContent = `Overall Score: ${emp.score}%`;
    document.getElementById("bonusValue").textContent = bouns;
  }
}

renderIdealEmployee();

//
