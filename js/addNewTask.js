const dataPath = "../data/data1.json";

const assigneeSelect = document.getElementById("assignees");
const taskForm = document.getElementById("taskForm");

// --- تحميل الموظفين ---
fetch(dataPath)
  .then((res) => {
    console.log("✅ Response object:", res);
    return res.json();
  })
  .then((data) => {
    console.log("📂 Full data from JSON:", data);

    const employees = data.employees;
    console.log("👥 All employees:", employees);

    const filteredEmployees = employees.filter(
      (emp) => emp.role === "Employee"
    );
    console.log("✅ Filtered employees (role=Employee):", filteredEmployees);

    filteredEmployees.forEach((emp) => {
      console.log(`➕ Adding option: [id=${emp.id}] ${emp.name}`);

      const option = document.createElement("option");
      option.value = emp.id; // نخزن ID
      option.textContent = emp.name; // نعرض الاسم
      assigneeSelect.appendChild(option);
    });

    console.log("🎉 All employee options added to dropdown.");
  })
  .catch((err) => console.error("❌ Error loading employees:", err));

// --- تخزين التاسك في localStorage ---
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // بناء التاسك بنفس الـ Schema الأصلي
  const task = {
    id: Date.now(), // ID فريد
    title: document.getElementById("title").value,
    description: document.getElementById("description").value || null,
    priority: document.getElementById("priority").value,
    status: document.getElementById("status").value,
    deadline: document.getElementById("deadline").value,
    assignees: [+document.getElementById("assignees").value], // Array زي السيستم
    attachments: [], // لو مفيش نحط Array فاضية
    comments: [], // Array فاضية
    createdAt: new Date().toISOString(), // وقت الإنشاء
    updatedAt: null, // لسه جديد
    createdBy: "Admin", // ثابت دلوقتي
    dependencyids: [], // Array فاضية
    history: [], // Array فاضية
  };

  console.log("📝 New task object (normalized):", task);

  // استرجاع الكوليكشن من الكاش أو إنشاء Array جديد
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  console.log("📦 Current cached tasks:", tasks);

  // إضافة التاسك الجديد
  tasks.push(task);
  console.log("➕ Task added to collection:", task);

  // حفظ الكوليكشن في الكاش
  localStorage.setItem("tasks", JSON.stringify(tasks));
  console.log("💾 Tasks collection saved in localStorage.");

  alert("✅ Task saved successfully!");
  taskForm.reset(); // مسح الفورم بعد الحفظ
});
