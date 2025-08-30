const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let role = loggedInUser?.role?.toLowerCase();

if (role !== "security") {
  attendance.style.display = "none";
} else {
    attendance.style.display = "";
}

if (role !== "employee") {
  my_attendance.style.display = "none";
  req.style.display = "none";
  my_tasks.style.display = "none";
} else {
  my_attendance.style.display = "";
  req.style.display = "";
  my_tasks.style.display = "";
}

if (role !== "manger") {
  team_tasks.style.display = "none";
  team_attendance.style.display = "none";
  approval.style.display = "none";
} else {
  team_tasks.style.display = "";
  team_attendance.style.display = "";
  approval.style.display = "";

}

if (role !== "hr") {
  settings.style.display = "none";
  reports.style.display = "none";
} else {
  settings.style.display = "";
  reports.style.display = "";
}
