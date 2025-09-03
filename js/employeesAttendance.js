/***** Sidebar *****/
// const links = document.querySelectorAll(".mynav a");
// const sections = document.querySelectorAll(".page-section");

// links.forEach((link) => {
//   link.addEventListener("click", (e) => {
//     e.preventDefault();

//     links.forEach((l) => l.classList.remove("active"));
//     link.classList.add("active");

//     sections.forEach((section) => section.classList.add("d-none"));

//     const route = link.getAttribute("data-route");
//     document.getElementById(route).classList.remove("d-none");
//   });
// });



/***** Settings *****/
const officialStart = "09:00"; // وقت بدء العمل الرسمي
const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

let employee = null;
let attendanceRecords = [];
let employeeIdToShow = null;

/***** loggedInUser *****/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")); 

// if (loggedInUser && loggedInUser.name) {
//     document.getElementById('username').textContent = loggedInUser.name;
// }

if (!loggedInUser) {
  console.error("No logged-in user found!");
} else {
  employeeIdToShow = loggedInUser.id;

  /***** Fetch data *****/
  fetch("/data/data1.json")
    .then(response => response.json())
    .then(data => {
      employee = data.employees.find(e => e.id === employeeIdToShow);

      attendanceRecords = data.attendanceRecords
        .filter(a => a.employeeId === employeeIdToShow)
        .sort((a, b) => a.date.localeCompare(b.date)); // ترتيب من الأقدم للأحدث

      if (!employee) {
        console.error("Employee not found!");
        return;
      }

      updateSummaryCards();
      populateAttendanceTable();
      initCalendar();
    })
    .catch(err => console.error("Error loading data:", err));
}

/***** Update Cards *****/
function updateSummaryCards() {
  if (!attendanceRecords || !attendanceRecords.forEach) return;
  const summary = { Present: 0, Late: 0, Absent: 0, Leave: 0, WFH: 0 };

  attendanceRecords.forEach(a => {
    if (a.isLeave) {
      summary.Leave++;
      a.status = "Leave";
      a.minutesLate = 0;
    } else if (a.isWFH) {
      summary.WFH++;
      a.status = "WFH";
      a.minutesLate = 0;
    } else if (a.checkIn) {
      const [hCheck, mCheck] = a.checkIn.split(":").map(Number);
      const [hOfficial, mOfficial] = officialStart.split(":").map(Number);
      const minutesLate = (hCheck*60 + mCheck) - (hOfficial*60 + mOfficial);

      a.minutesLate = minutesLate > 0 ? minutesLate : 0;
      a.status = minutesLate > 0 ? "Late" : "Present";

      if (minutesLate > 0) summary.Late++;
      else summary.Present++;
    } else {
      summary.Absent++;
      a.minutesLate = 0;
      a.status = "Absent";
    }
  });

  document.getElementById("presentCount").innerText = summary.Present;
  document.getElementById("lateCount").innerText = summary.Late;
  document.getElementById("absentCount").innerText = summary.Absent;
  document.getElementById("leaveCount").innerText = summary.Leave;
  document.getElementById("wfhCount").innerText = summary.WFH;
}

/***** Get Hours *****/
function getTotalHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  const total = (h2*60 + m2) - (h1*60 + m1);
  const hours = Math.floor(total/60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
}

/***** Status Colors *****/
function getStatusColor(a) {
  switch(a.status) {
    case "Present": return "#0f8a46";
    case "Late": return "#b25a00";
    case "Absent": return "#c12a2a";
    case "Leave": return "#5a32c2";
    case "WFH": return "#2563eb";
    default: return "#999";
  }
}

/***** Populate Table *****/
function populateAttendanceTable() {
  const tbody = document.getElementById("attendanceTable");
  tbody.innerHTML = "";

  attendanceRecords.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.date}</td>
      <td>${employee.name}</td>
      <td>${a.checkIn || "-"}</td>
      <td>${a.checkOut || "-"}</td>
      <td><span class="badge" style="background-color:${getStatusColor(a)}; color:white">${a.status}</span></td>
      <td>${a.minutesLate}</td>
      <td>${getTotalHours(a.checkIn, a.checkOut)}</td>
    `;
    tbody.appendChild(tr);
  });
}

/***** Calendar *****/
function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 400,
    events: attendanceRecords.map(a => ({
      title: a.status,
      start: a.date,
      backgroundColor: getStatusColor(a),
      borderColor: getStatusColor(a),
      textColor: 'white',
      description: a.notes || ""
    }))
  });
  calendar.render();
}
