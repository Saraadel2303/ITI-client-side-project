// export default class Task {
//   constructor() {}

//   static async getTasks() {
//     try {
//       let tasks = JSON.parse(localStorage.getItem("tasks"));
//       if (tasks) {
//         return tasks;
//       }
//       const response = await fetch("/data/data1.json");
//       const data = await response.json();
//       localStorage.setItem("tasks", JSON.stringify(tasks));

//       return data.tasks;
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       return [];
//     }
//   }

//   static async employeeTasks(id) {
//     try {
//       let empTasks = JSON.parse(localStorage.getItem("tasks"));
//       if (empTasks) {
//         return empTasks.filter((el) => el.assignees.includes(id));
//       }
//       const response = await fetch("/data/data1.json");
//       const data = await response.json();
//       empTasks = data.tasks.filter((el) => el.assignees.includes(id));
//       localStorage.setItem("emp_tasks", JSON.stringify(empTasks));

//       return empTasks;
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       return [];
//     }
//   }

//   static async updateAllTask(task) {
//     try {
//       let tasks = await Task.getTasks();
//       let newTasks = tasks.map((obj) =>
//         +obj.id === +task.id ? { ...task } : obj
//       );
//       localStorage.setItem("tasks", JSON.stringify(newTasks));
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       return [];
//     }
//   }

//   static async updateTask(task, empId) {
//     try {
//       let empTasks = await Task.employeeTasks(empId);
//       let tasks = await Task.updateAllTask(task);
//       let newTasks = empTasks.map((obj) =>
//         +obj.id === +task.id ? { ...task } : obj
//       );
//       localStorage.setItem("emp_tasks", JSON.stringify(newTasks));
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       return [];
//     }
//   }
// }

export default class Task {
  constructor() {}

  static async getTasks() {
    try {
      console.log("📥 [Task.getTasks] Fetching tasks from localStorage...");
      let tasks = JSON.parse(localStorage.getItem("tasks"));

      if (tasks) {
        console.log("✅ [Task.getTasks] Found tasks in localStorage:", tasks);
        return tasks;
      }

      console.log(
        "🌐 [Task.getTasks] Fetching tasks from /data/data1.json ..."
      );
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      console.log(
        "✅ [Task.getTasks] Tasks loaded from JSON file:",
        data.tasks
      );
      localStorage.setItem("tasks", JSON.stringify(data.tasks));

      return data.tasks;
    } catch (error) {
      console.error("❌ [Task.getTasks] Error loading tasks:", error);
      return [];
    }
  }

  static async employeeTasks(id) {
    try {
      console.log(
        `📥 [Task.employeeTasks] Fetching tasks for employeeId=${id}`
      );
      let empTasks = JSON.parse(localStorage.getItem("tasks"));

      if (empTasks) {
        console.log(
          "🔍 [Task.employeeTasks] Found tasks in localStorage:",
          empTasks
        );
        let filtered = empTasks.filter((el) =>
          (el.assignees || []).includes(id)
        );
        console.log(
          `✅ [Task.employeeTasks] Filtered tasks for employeeId=${id}:`,
          filtered
        );
        return filtered;
      }

      console.log("🌐 [Task.employeeTasks] Fetching from /data/data1.json ...");
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      empTasks = data.tasks.filter((el) => (el.assignees || []).includes(id));
      console.log(
        `✅ [Task.employeeTasks] Filtered tasks for employeeId=${id} from JSON:`,
        empTasks
      );

      localStorage.setItem("emp_tasks", JSON.stringify(empTasks));
      return empTasks;
    } catch (error) {
      console.error(
        "❌ [Task.employeeTasks] Error loading employee tasks:",
        error
      );
      return [];
    }
  }

  static async updateAllTask(task) {
    try {
      console.log("♻️ [Task.updateAllTask] Updating task:", task);

      let tasks = await Task.getTasks();
      console.log("📂 [Task.updateAllTask] Current tasks:", tasks);

      let newTasks = tasks.map((obj) =>
        +obj.id === +task.id ? { ...task } : obj
      );

      console.log("✅ [Task.updateAllTask] Updated tasks:", newTasks);
      localStorage.setItem("tasks", JSON.stringify(newTasks));
    } catch (error) {
      console.error("❌ [Task.updateAllTask] Error updating tasks:", error);
      return [];
    }
  }

  static async updateTask(task, empId) {
    try {
      console.log(
        `♻️ [Task.updateTask] Updating task=${task.id} for empId=${empId}`
      );

      let empTasks = await Task.employeeTasks(empId);
      console.log(
        `📂 [Task.updateTask] Current employee tasks for empId=${empId}:`,
        empTasks
      );

      await Task.updateAllTask(task);

      let newTasks = empTasks.map((obj) =>
        +obj.id === +task.id ? { ...task } : obj
      );

      console.log("✅ [Task.updateTask] Updated employee tasks:", newTasks);
      localStorage.setItem("emp_tasks", JSON.stringify(newTasks));
    } catch (error) {
      console.error(
        "❌ [Task.updateTask] Error updating employee tasks:",
        error
      );
      return [];
    }
  }
}
