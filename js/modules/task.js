export default class Task {
  constructor() {}

  static async getTasks() {
    try {
      let tasks = JSON.parse(localStorage.getItem("tasks"));
      if (tasks) {
        return tasks;
      }
      const response = await fetch("/data/data1.json");
      const data = await response.json();
      localStorage.setItem("tasks", JSON.stringify(tasks));

      return data.tasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static async employeeTasks(id) {
    try {
      let empTasks = JSON.parse(localStorage.getItem("tasks"));
      if (empTasks) {
        return empTasks.filter((el) => el.assignees.includes(id));
      }
      const response = await fetch("/data/data1.json");
      const data = await response.json();
      empTasks = data.tasks.filter((el) => el.assignees.includes(id));
      localStorage.setItem("emp_tasks", JSON.stringify(empTasks));

      return empTasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static async updateAllTask(task) {
    try {
      let tasks = await Task.getTasks();
      let newTasks = tasks.map((obj) =>
        obj.id == task.id ? { ...task } : obj
      );
      localStorage.setItem("tasks", JSON.stringify(newTasks));
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static async updateTask(task, empId) {
    try {
      let empTasks = await Task.employeeTasks(empId);
      let tasks = await Task.updateAllTask(task);
      let newTasks = empTasks.map((obj) =>
        obj.id == task.id ? { ...task } : obj
      );
      localStorage.setItem("emp_tasks", JSON.stringify(newTasks));
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }
}
