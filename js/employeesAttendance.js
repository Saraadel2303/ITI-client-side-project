const officialStart = "09:00";
const todayStr = new Date().toISOString().slice(0, 10);

let attendanceRecords = [];
let employeeIdToShow = null;

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser) {
  console.error("No logged-in user found in localStorage!");
} else {
  employeeIdToShow = loggedInUser.id;

  const storedAttendance = JSON.parse(localStorage.getItem("attendance")) || [];

  attendanceRecords = storedAttendance
    .filter((a) => a.employeeId === employeeIdToShow)
    .sort((b, a) => a.date.localeCompare(b.date));

  updateSummaryCards();
  populateAttendanceTable();
  initCalendar();
}

function updateSummaryCards() {
  if (!attendanceRecords || !attendanceRecords.forEach) return;
  const summary = { Present: 0, Late: 0, Absent: 0, Leave: 0, WFH: 0 };

  attendanceRecords.forEach((a) => {
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
      const minutesLate =
        hCheck * 60 + mCheck - (hOfficial * 60 + mOfficial) - 15;

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

function getTotalHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return "-";
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  const total = h2 * 60 + m2 - (h1 * 60 + m1);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours}h ${minutes}m`;
}

function getStatusColor(a) {
  switch (a.status) {
    case "Present":
      return "#0f8a46";
    case "Late":
      return "#b25a00";
    case "Absent":
      return "#c12a2a";
    case "Leave":
      return "#5a32c2";
    case "WFH":
      return "#2563eb";
    default:
      return "#999";
  }
}

function populateAttendanceTable() {
  const tbody = document.getElementById("attendanceTable");
  tbody.innerHTML = "";

  attendanceRecords.forEach((a) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.date}</td>
      <td>${a.checkIn || "-"}</td>
      <td>${a.checkOut || "-"}</td>
      <td><span class="badge" style="background-color:${getStatusColor(
        a
      )}; color:white">${a.status}</span></td>
      <td>${a.minutesLate}</td>
      <td>${getTotalHours(a.checkIn, a.checkOut)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: 400,
    events: attendanceRecords.map((a) => ({
      title: a.status,
      start: a.date,
      backgroundColor: getStatusColor(a),
      borderColor: getStatusColor(a),
      textColor: "white",
      description: a.notes || "",
    })),
  });
  calendar.render();
}
