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
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      return data.tasks.filter((el) => el.assignees.includes(id));
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }
}
