let role = localStorage.getItem("role") ?? 'employee';

if (role !== "security") {
    attendance.style.display = "none"
}


if (role !== "employee") {
    my_attendance.style.display = "none"
    req.style.display = "none"
    my_tasks.style.display = "none"
}


if (role !== "manger") {
    team_tasks.style.display = "none"
    team_attendance.style.display = "none"
    approval.style.display = "none"
}

if (role !== "hr") {
    settings.style.display = "none"
}