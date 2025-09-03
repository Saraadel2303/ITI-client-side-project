export default class Task {
  constructor() {}

  static async getTasks() {
    try {
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      return data.tasks;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static async employeeTasks(id) {
    try {
      let empTasks = JSON.parse(localStorage.getItem("emp_tasks"));
      if (empTasks) {
        return empTasks;
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

  static async updateTask(id, task, empId) {
    try {
      console.log(task);
      let empTasks = await Task.employeeTasks(empId);
      let newTasks = empTasks.map((obj) => (obj.id == id ? { ...task } : obj));
      localStorage.setItem("emp_tasks", JSON.stringify(newTasks));
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }
}
