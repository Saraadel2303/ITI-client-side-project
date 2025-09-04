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
      let empRequests = JSON.parse(localStorage.getItem("emp_requests"));
      if (empRequests) {
        return empRequests;
      }
      const response = await fetch("/data/data1.json");
      const data = await response.json();
      empRequests = data.requests.filter((el) => el.employeeId == id);
      localStorage.setItem("emp_requests", JSON.stringify(empRequests));
      return empRequests;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }
  static async saveEmployeeRequest(newId,empId, type, payload, status) {
    let empRequests = await Request.employeeRequests(empId);
    let newRequest = {
      id: newId,
      employeeId: empId,
      type: type,
      createdAt: new Date().toLocaleString("sv-SE", { timeZone: "Africa/Cairo" }),
      status: status,
      payload: payload,
      decidedAt: "",
      managerComment: "",
    };
    empRequests.push(newRequest);
    localStorage.setItem("emp_requests", JSON.stringify(empRequests));
  }
}
