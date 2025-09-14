import { loadData } from "./dataService.js";

const today = new Date().toISOString().split("T")[0];

// number of employees
export async function getEmpCount() {
  const data = await loadData();
  return (data.employees || []).length;
}

//number of presents today
// export async function getPresntsToday() {
//   // const data = await loadData();
//   // return (data.attendanceRecords || []).filter(
//   //   (r) => r.date === today && r.status === "Present"
//   // ).length;
//   // #### local storage#####
//   const data = JSON.parse(localStorage.getItem("attendance")) || [];
//   return data.filter((r) => r.date === today && r.status === "Present" ,"Late").length;
// }
export async function getPresntsToday() {
  const data = JSON.parse(localStorage.getItem("attendance")) || [];
  return data.filter(
    (r) => r.date === today && (r.status === "Present" || r.status === "Late")
  ).length;
}


//number of absents today
// export async function getAbsentCount() {
//   const data = await loadData();
//   return (data.attendanceRecords || []).filter(
//     (r) => r.date === today && r.status === "Absent"
//   ).length;
// }
// from local storage
export function getAbsentCount() {
  const data = JSON.parse(localStorage.getItem("attendance")) || [];
  return data.filter((r) => r.date === today && r.status === "Absent").length;
}
// getAbsentCount()

// number of WFH today
export async function getWFHCount() {
  const data = JSON.parse(localStorage.getItem("attendance")) || [];
  return (data || []).filter(
    (r) => r.date === today && r.status === "WFH"
  ).length;
}

// get late tasks count
export async function getLateTasksCount() {
  const data = await loadData();
  return (data.tasks || []).filter(
    (t) => new Date(t.deadline) < new Date(today) && t.status !== "Completed"
  ).length;
}

// attendance trend for last 7 days
export async function getAttendanceTrend(days = 7) {
  // const data = await loadData();
  // const records = data.attendanceRecords || [];
  // from local storage
  const records = JSON.parse(localStorage.getItem("attendance")) || [];

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

// tasks status count
export async function getTasksStatusCount() {
  const data = await loadData();
  const tasks = data.tasks || [];

  return {
    completed: tasks.filter((t) => t.status === "Completed").length,
    "To Do": tasks.filter((t) => t.status === "To Do").length,
    "In Progress": tasks.filter((t) => t.status === "In Progress").length,
  };
}

// number of departments
export async function getDepartmentCount() {
  const data = await loadData();
  const employees = data.employees || [];

  const deptSet = new Set(
    employees.map((emp) => emp.department).filter(Boolean)
  );

  return deptSet.size;
}

// number of employees in each department
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

// avg attendance
export async function getAvgAttendance() {
  const data = await loadData();
  const records = data.attendanceRecords || [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyRecords = records.filter((r) => {
    const d = new Date(r.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  if (monthlyRecords.length === 0) return 0;

  let presentCount = monthlyRecords.filter(
    (r) => r.status === "Present" || r.status === "Late" || r.status === "WFH"
  ).length;

  let total = monthlyRecords.length;

  return +((presentCount / total) * 100).toFixed(0);
}

// avg employees per department
export async function getEmployeesPerDeptAvg() {
  const data = await loadData();
  const employees = data.employees || [];

  const deptSet = new Set(
    employees.map((emp) => emp.department).filter(Boolean)
  );
  const deptCount = deptSet.size || 1;

  return +(employees.length / deptCount).toFixed(1);
}

// chart for employees by department
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

// avg attendance per department
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

// top 3 ideal emp
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

    scores.push({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      score: finalScore,
    });
  });

  return scores.sort((a, b) => b.score - a.score).slice(0, 3);
}

// bring back the top one of ideal emp
export async function getIdealEmployee() {
  const top = await getTopIdealEmployees();
  return top[0];
}

//sorting employees by department
export function empSort(a, b) {
  if (a.department < b.department) return -1;
  if (a.department > b.department) return 1;
  return a.name.localeCompare(b.name);
}

//payroll impact fun

export async function buildPayrollRows(settings) {
  if (!settings) {
    settings = JSON.parse(localStorage.getItem("settings")) || {};
  }

  settings.penalties = settings.penalties || {
    "16_30": 0,
    "31_60": 0,
    "61_120": 0,
    cap: 25,
  };
  settings.overtime = settings.overtime || {
    policy: "pay",
    weekday: 1.25,
    weekend: 1.5,
  };
  settings.ideal = settings.ideal || { bonus: 10, badge: "🌟 Ideal Employee" };

  const data = await loadData();
  const employees = data.employees || [];
  const attendance = data.attendanceRecords || [];
  const overtime = data.overtime || [];
  const tasks = data.tasks || [];

  const idealEmp = await getIdealEmployee();

  const rows = employees.map((emp) => {
    const baseSalary = parseFloat(emp.monthlySalary) || 0;
    let deductions = 0;
    let bonus = 0;

    // deduction from late
    const empAttendance = attendance.filter((r) => r.employeeId === emp.id);
    let empDeductions = 0;

    empAttendance.forEach((r) => {
      if (r.status === "Late" && r.minutesLate) {
        if (r.minutesLate >= 16 && r.minutesLate <= 30) {
          empDeductions += (settings.penalties["16_30"] / 100) * baseSalary;
        } else if (r.minutesLate >= 31 && r.minutesLate <= 60) {
          empDeductions += (settings.penalties["31_60"] / 100) * baseSalary;
        } else if (r.minutesLate >= 61 && r.minutesLate <= 120) {
          empDeductions += (settings.penalties["61_120"] / 100) * baseSalary;
        }
      }
    });

    const capAmount = (settings.penalties.cap / 100) * baseSalary;
    deductions += Math.min(empDeductions, capAmount);
    //deduction from late tasks
    const empTasks = tasks.filter((t) => t.employeeId === emp.id);
    empTasks.forEach((t) => {
      if (new Date(t.deadline) < new Date() && t.status !== "Completed") {
        deductions += 0.05 * baseSalary;
      }
    });

    //over time bouns
    const empOvertime = overtime.filter((o) => o.employeeId === emp.id);
    empOvertime.forEach((o) => {
      const hours = o.hours || 0;
      if (o.type === "weekday") {
        bonus += hours * (settings.overtime.weekday - 1) * (baseSalary / 160);
      } else if (o.type === "weekend") {
        bonus += hours * (settings.overtime.weekend - 1) * (baseSalary / 160);
      }
    });

    // Ideal Employee Bonus
    if (idealEmp && emp.id === idealEmp.id) {
      bonus += (settings.ideal.bonus / 100) * baseSalary;
    }
    // console.log(idealEmp);

    const netSalary = baseSalary - deductions + bonus;
    return {
      id: emp.id,
      name:
        emp.name +
        (idealEmp && emp.id === idealEmp.id ? ` ${settings.ideal.badge}` : ""),
      baseSalary: baseSalary.toFixed(2),
      deductions: deductions.toFixed(2),
      bonus: bonus.toFixed(2),
      netSalary: netSalary.toFixed(2),
    };
  });

  return rows;
}
