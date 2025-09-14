/***** Sidebar *****/
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

/***** loggedInUser *****/
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedInUser && loggedInUser.name) {
  document.getElementById("username").textContent = loggedInUser.name;
}

/***** 1) Basic variables *****/
let employees = [];
let requests = [];
let attendance = [];
let selectedAction = null;

/***** 2) Utility functions *****/
function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function getEmployee(empId) {
  return employees.find((e) => e.id == empId) || { name: "N/A", id: empId };
}

function getStatus(record) {
  if (record.isLeave) return "Leave";
  if (record.isWFH) return "WFH";
  if (!record.checkIn) return "Absent";
  if (record.checkIn <= "09:15") return "Present";
  if (record.checkIn <= "11:00") return "Late";
  return "Absent";
}

function getStatusClass(status) {
  const map = {
    Present: "status-present",
    Late: "status-late",
    Leave: "status-leave",
    WFH: "status-wfh",
    Absent: "status-absent",
  };
  return map[status] || "status-absent";
}

function hasApprovedRequest(employeeId, type) {
  return requests.some(
    (r) =>
      r.employeeId == employeeId &&
      (r.type || "").toLowerCase() === type.toLowerCase() &&
      r.status === "Approved"
  );
}

/***** 3) Build row *****/
function buildRowHtml(record) {
  const employee = getEmployee(record.employeeId);
  const status = getStatus(record);
  const statusClass = getStatusClass(status);
  const disabled = record.isLeave ? "disabled" : "";

  const leaveBadge = record.isLeave
    ? `<span class="badge bg-info me-1">Leave</span>`
    : "";
  const wfhBadge = record.isWFH
    ? `<span class="badge bg-primary">WFH</span>`
    : "";

  return `
    <tr>
      <td><input type="checkbox" class="row-checkbox" data-id="${
        record.employeeId
      }"></td>
      <td>${record.date}</td>
      <td>${employee.name}</td>
      <td>${employee.id}</td>
      <td>
        <input type="time" class="form-control form-control-sm"
               value="${record.checkIn || ""}"
               data-id="${record.employeeId}" data-type="checkin" ${disabled}>
      </td>
      <td>
        <input type="time" class="form-control form-control-sm"
               value="${record.checkOut || ""}"
               data-id="${record.employeeId}" data-type="checkout" ${disabled}>
      </td>
      <td><span class="status ${statusClass}">${status}</span></td>
      <td class="action-cell">${leaveBadge} ${wfhBadge}</td>
    </tr>
  `;
}

/***** 4) Render table *****/
function renderRows(list) {
  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = list.map(buildRowHtml).join("");
  updateStats();
}

function renderTable() {
  renderRows(attendance);
}

/***** 5) Load data *****/
function initData() {
  const today = getTodayStr();

  return fetch("/data/data1.json")
    .then((res) => res.json())
    .then((data) => {
      employees = data.employees || [];
      requests = data.requests || [];

      attendance = employees.map((emp) => ({
        employeeId: emp.id,
        date: today,
        checkIn: "",
        checkOut: "",
        isLeave: false,
        isWFH: false,
        notes: "",
        status: "Absent",
      }));
    });
}

/***** 6) Status *****/
function updateStats() {
  attendance.forEach((r) => (r.status = getStatus(r)));
  const total = attendance.length;
  const present = attendance.filter((r) => r.status === "Present").length;
  const late = attendance.filter((r) => r.status === "Late").length;
  const leave = attendance.filter((r) => r.isLeave).length;
  const wfh = attendance.filter((r) => r.isWFH).length;
  const absent = attendance.filter(
    (r) => r.status === "Absent" && !r.isLeave && !r.isWFH
  ).length;

  const cards = document.querySelectorAll(".stat-card p");
  if (cards.length >= 6) {
    cards[0].textContent = total;
    cards[1].textContent = present;
    cards[2].textContent = late;
    cards[3].textContent = absent;
    cards[4].textContent = leave;
    cards[5].textContent = wfh;
  }
}

/***** 7) Check in/out changes *****/
document.addEventListener("change", function (e) {
  if (
    !e.target.matches('input[data-type="checkin"], input[data-type="checkout"]')
  )
    return;

  const empId = e.target.dataset.id;
  const type = e.target.dataset.type;
  const val = e.target.value;

  const rec = attendance.find((r) => String(r.employeeId) === String(empId));
  if (!rec) return;

  if (type === "checkin") rec.checkIn = val;
  if (type === "checkout") rec.checkOut = val;

  if (rec.checkIn && rec.checkOut && rec.checkIn > rec.checkOut) {
    alert(
      `⚠ Check-in cannot be after Check-out for ${
        getEmployee(rec.employeeId).name
      }`
    );
  }

  renderTable();
});
// minutesLate
function calculateMinutesLate(checkIn) {
  if (!checkIn) return 0;

  const [h, m] = checkIn.split(":").map(Number);
  const checkInMinutes = h * 60 + m;

  const workStart = 9 * 60; 
  return checkInMinutes > workStart ? checkInMinutes - workStart : 0;
}
/***** 8) Bulk actions *****/
function setupBulkHandlers() {
  const selectAllEl =
    document.getElementById("selectAll") ||
    document.querySelector("table thead input[type='checkbox']");

  if (selectAllEl) {
    selectAllEl.addEventListener("change", function () {
      document
        .querySelectorAll(".row-checkbox")
        .forEach((cb) => (cb.checked = this.checked));
    });
  }

  document.querySelectorAll(".bulk-action").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      document
        .querySelectorAll(".bulk-action")
        .forEach((x) => x.classList.remove("active"));
      this.classList.add("active");
      selectedAction = (this.dataset.action || "").toLowerCase();
    });
  });

  const applyBtn =
    document.getElementById("applyBulk") ||
    document.querySelector(".bulk-actions .btn-success");

  if (applyBtn) {
    applyBtn.addEventListener("click", function () {
      if (!selectedAction) return alert("⚠ Please select a bulk action first!");
      const checked = Array.from(
        document.querySelectorAll(".row-checkbox:checked")
      );
      if (!checked.length)
        return alert("⚠ Please select at least one employee!");

      checked.forEach((cb) => {
        const empId = cb.dataset.id;
        const rec = attendance.find(
          (r) => String(r.employeeId) === String(empId)
        );
        if (!rec) return;

        if (selectedAction === "leave") {
          if (!hasApprovedRequest(empId, "leave")) return alert("Not Found");
          rec.isLeave = true;
          rec.isWFH = false;
        } else if (selectedAction === "wfh") {
          if (!hasApprovedRequest(empId, "wfh")) return alert("Not Found");
          rec.isWFH = true;
          rec.isLeave = false;
        } else if (selectedAction === "checkin") {
          rec.checkIn = rec.checkIn || "09:00";
        } else if (selectedAction === "checkout") {
          rec.checkOut = rec.checkOut || "17:00";
        }
      });

      selectedAction = null;
      document
        .querySelectorAll(".bulk-action")
        .forEach((x) => x.classList.remove("active"));
      if (selectAllEl) selectAllEl.checked = false;

      renderTable();
    });
  }
}

/***** 9) Filters *****/
function setupFilters() {
  const searchInput = document.querySelector(".search-group input");
  const statusItems = document.querySelectorAll(
    ".search-group .dropdown-menu .dropdown-item"
  );

  if (searchInput) searchInput.addEventListener("input", filterTable);

  if (statusItems.length) {
    statusItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        statusItems.forEach((x) => x.classList.remove("active"));
        this.classList.add("active");
        filterTable();
      });
    });
  }
}

function filterTable() {
  const searchVal = (
    document.querySelector(".search-group input")?.value || ""
  ).toLowerCase();
  const selectedStatus =
    document.querySelector(".search-group .dropdown-menu .active")
      ?.textContent || "";

  const filtered = attendance.filter((rec) => {
    const emp = getEmployee(rec.employeeId);
    const matchesSearch =
      (emp.name || "").toLowerCase().includes(searchVal) ||
      String(emp.id).includes(searchVal);
    const status = getStatus(rec);
    const matchesStatus = !selectedStatus || status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  renderRows(filtered);
}

/***** 10) Save data to localStorage *****/
document.getElementById("saveBtn")?.addEventListener("click", () => {
  attendance.forEach((r) => {
    r.status = getStatus(r);
    r.minutesLate = calculateMinutesLate(r.checkIn);
  });

  let allRecords = JSON.parse(localStorage.getItem("attendance")) || [];
  const today = new Date().toISOString().split("T")[0];
  allRecords = allRecords.filter((rec) => rec.date !== today);

  allRecords.push(...attendance);
  localStorage.setItem("attendance", JSON.stringify(allRecords));

  alert("✅ Today's attendance saved!");
});

/***** 11) Initialize *****/
initData()
  .then(() => {
    renderTable();
    setupBulkHandlers();
    setupFilters();
  })
  .catch((err) => console.error(err));
