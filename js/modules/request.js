export default class Request {
  constructor() {}

  static async getRequests() {
    try {
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      return data.requests;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  static async employeeRequests(id) {
    try {
      const response = await fetch("/data/data1.json");
      const data = await response.json();

      return data.requests.filter((el) => el.employeeId == id);
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }
}
