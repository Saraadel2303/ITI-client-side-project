import { loadData } from "./dataService.js";

const today = new Date().toISOString().split("T")[0]; 

// ----------- عدد الموظفين -----------
export async function getEmpCount() {
  const data = await loadData();
  return (data.employees || []).length;
}

// ----------- عدد الحضور النهاردة -----------
export async function getPresntsToday() {
  const data = await loadData();
  return (data.attendanceRecords || []).filter(
    (r) => r.date === today && r.status === "Present"
  ).length;
}

// ----------- عدد الغياب النهاردة -----------
export async function getAbsentCount() {
  const data = await loadData();
  return (data.attendanceRecords || []).filter(
    (r) => r.date === today && r.status === "Absent"
  ).length;
}

// ----------- عدد طلبات WFH النهاردة -----------
export async function getWFHCount() {
  const data = await loadData();
  return (data.requests || []).filter(
    (r) => r.date === today && r.type === "WFH"
  ).length;
}

// ----------- عدد المهام المتأخرة -----------
export async function getLateTasksCount() {
  const data = await loadData();
  return (data.tasks || []).filter(
    (t) => new Date(t.deadline) < new Date(today) && t.status !== "Completed"
  ).length;
}

// ----------- اتجاه الحضور لآخر X يوم -----------
export async function getAttendanceTrend(days = 7) {
  const data = await loadData();
  const records = data.attendanceRecords || [];

  const today = new Date();
  const trend = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const dayRecords = records.filter((r) => r.date === dateStr);

    trend.push({
      date: dateStr,
      present: dayRecords.filter((r) => r.status === "Present").length,
      absent: dayRecords.filter((r) => r.status === "Absent").length,
    });
  }
  return trend;
}

// ----------- حالة المهام -----------
export async function getTasksStatusCount() {
  const data = await loadData();
  const tasks = data.tasks || [];

  return {
    completed: tasks.filter((t) => t.status === "Completed").length,
    "To Do": tasks.filter((t) => t.status === "To Do").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
  };
}

// ----------- عدد الأقسام -----------
export async function getDepartmentCount() {
  const data = await loadData();
  const employees = data.employees || [];

  const deptSet = new Set(
    employees.map((emp) => emp.department).filter(Boolean)
  );

  return deptSet.size;
}

// ----------- عدد الموظفين في كل قسم -----------
export async function departmentEmpCount() {
  const data = await loadData();
  const employees = data.employees || [];
  const deptCounts = {};

  employees.forEach((emp) => {
    const dept = emp.department || "Unknown";
    if (!deptCounts[dept]) deptCounts[dept] = 0;
    deptCounts[dept]++;
  });

  return deptCounts;
}

// ----------- متوسط نسبة الحضور العامة -----------
export async function getAvgAttendance() {
  const data = await loadData();
  const records = data.attendanceRecords || [];

  if (records.length === 0) return 0;

  let presentCount = records.filter(
    (r) => r.status === "Present" || r.status === "Late" || r.status === "WFH"
  ).length;

  let total = records.length;

  return +((presentCount / total) * 100).toFixed(0);
}

// ----------- متوسط عدد الموظفين لكل قسم -----------
export async function getEmployeesPerDeptAvg() {
  const data = await loadData();
  const employees = data.employees || [];

  const deptSet = new Set(
    employees.map((emp) => emp.department).filter(Boolean)
  );
  const deptCount = deptSet.size || 1; 

  return +(employees.length / deptCount).toFixed(1);
}

// ----------- توزيع الموظفين حسب الأقسام (للـ Chart) -----------
export async function getEmployeesByDepartment() {
  const data = await loadData();
  const employees = data.employees || [];
  const deptCounts = {};

  employees.forEach((emp) => {
    const dept = emp.department || "Unknown";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  return {
    labels: Object.keys(deptCounts),
    counts: Object.values(deptCounts),
  };
}

// ----------- متوسط الحضور لكل قسم -----------
export async function getAvgAttendancePerDept() {
  const data = await loadData();
  const employees = data.employees || [];
  const records = data.attendanceRecords || [];

  const deptTotals = {};
  const deptPresent = {};

  employees.forEach((emp) => {
    if (!deptTotals[emp.department]) {
      deptTotals[emp.department] = 0;
      deptPresent[emp.department] = 0;
    }
  });

  records.forEach((r) => {
    const emp = employees.find((e) => e.id === r.employeeId);
    if (!emp) return;
    const dept = emp.department || "Unknown";

    deptTotals[dept]++;
    if (["Present", "Late", "WFH"].includes(r.status)) {
      deptPresent[dept]++;
    }
  });

  const labels = Object.keys(deptTotals);
  const values = labels.map((dept) =>
    ((deptPresent[dept] / deptTotals[dept]) * 100).toFixed(0)
  );

  return { labels, values };
}

// ----------- أفضل 3 موظفين  -----------
export async function getTopIdealEmployees() {
  const data = await loadData();
  const employees = data.employees || [];
  const attendance = data.attendanceRecords || [];
  const tasks = data.tasks || [];

  const scores = [];

  employees.forEach((emp) => {
    const empAttendance = attendance.filter((r) => r.employeeId === emp.id);
    const empTasks = tasks.filter((t) => t.employeeId === emp.id);

    const totalDays = empAttendance.length || 1;
    const presentDays = empAttendance.filter(
      (r) => r.status === "Present"
    ).length;
    const attendancePct = (presentDays / totalDays) * 100;

    const totalTasks = empTasks.length || 1;
    const completedTasks = empTasks.filter(
      (t) => t.status === "Completed"
    ).length;
    const tasksPct = (completedTasks / totalTasks) * 100;

    const finalScore = ((attendancePct + tasksPct) / 2).toFixed(0);

    scores.push({ name: emp.name, score: finalScore });
  });

  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}

// ----------- الموظف المثالي (الأول) -----------
export async function getIdealEmployee() {
  const top = await getTopIdealEmployees();
  return top[0];
}

// ----------- هل الموظف غائب النهاردة؟ -----------
export function isAbsentToday(data, empId, today) {
  if (!data || !data.attendanceRecords) return false;
  return data.attendanceRecords.some(
    (r) =>
      r.employeeId === empId &&
      r.date === today &&
      r.status === "Absent" &&
      !r.isWFH &&
      !r.isLeave
  );
}

// ----------- عدد مرات التأخير لموظف -----------
export function getLateCount(data, empId) {
  if (!data || !data.attendanceRecords) return 0;
  return data.attendanceRecords.filter(
    (r) => r.employeeId === empId && r.status === "Late" && r.minutesLate > 0
  ).length;
}

// ----------- الموظفين المتأخرين النهاردة (مرتبة حسب القسم) -----------
export function getLateEmployeesTodaySorted(data, today) {
  if (!data || !data.employees || !data.attendanceRecords) return [];

  const todayLates = data.attendanceRecords.filter(
    (r) => r.date === today && r.status === "Late" && r.minutesLate > 0
  );

  const employees = todayLates.map((r) => {
    const emp = data.employees.find((e) => e.id === r.employeeId);
    return {
      id: emp?.id || "-",
      name: emp?.username || "Unknown",
      department: emp?.department || "-",
      minutesLate: r.minutesLate,
    };
  });

  return employees.sort((a, b) => a.department.localeCompare(b.department));
}
