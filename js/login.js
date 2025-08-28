document.addEventListener("DOMContentLoaded", () => {

  // ================== SIGN IN VALIDATION & REDIRECT ================== //
  async function getUserByUsernameAndPassword(username, password) {
    try {
      const response = await fetch("data/data1.json"); 
      const data = await response.json();

      const user = data.employees.find(
        u =>
          u.username.toLowerCase() === username.toLowerCase() &&
          u.password === password
      );

      if (user) {
        return user.role.toLowerCase(); 
      }

      return null;
    } catch (error) {
      console.error("❌ Error loading data.json:", error);
      return null;
    }
  }

  // Sign In form
  const signInForm = document.getElementById("signInForm");
  if (signInForm) {
    signInForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      let username = document.getElementById("signinUsername").value.trim();
      let password = document.getElementById("signinPassword").value.trim();
      let valid = true;

      // Username check
      if (!validateUsername(username)) {
        showError(
          "signinUsername",
          "signinUsernameError",
          "❌ Username is required"
        );
        valid = false;
      } else {
        showError("signinUsername", "signinUsernameError", "");
      }

      // Password check
      if (!validatePassword(password)) {
        showError(
          "signinPassword",
          "signinPasswordError",
          "Password must be at least 5 characters"
        );
        valid = false;
      } else {
        showError("signinPassword", "signinPasswordError", "");
      }

      if (valid) {
        const userType = await getUserByUsernameAndPassword(username, password);
        if (userType === "employee") {
          window.location.href = "pages/employees.html";
        } else if (userType === "manager") {
          window.location.href = "pages/managers.html";
        } else if (userType === "hr") {
          window.location.href = "pages/hr.html";
        } else if (userType === "security") {
          window.location.href = "pages/security.html";
        } else {
          showError(
            "signinUsername",
            "signinUsernameError",
            "❌ Username or password is incorrect!"
          );
          showError("signinPassword", "signinPasswordError", "");
        }
      }
    });
  }

  // ================== FORM VALIDATION ================== //
  function validateUsername(username) {
    return username.length > 0;
  }

  function validatePassword(password) {
    return password.length >= 5;
  }

  function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    if (message) {
      error.textContent = message;
      input.classList.add("input-error");
    } else {
      error.textContent = "";
      input.classList.remove("input-error");
    }
  }
});
