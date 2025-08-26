const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// ================== FORM VALIDATION ================== //
function validateEmail(email) {
  return email.toLowerCase().endsWith("@example.com");
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

// Sign Up validation
document.getElementById("signUpForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let email = document.getElementById("signupEmail").value.trim();
  let password = document.getElementById("signupPassword").value.trim();
  let valid = true;

  // Email check
  if (!validateEmail(email)) {
    showError("signupEmail", "signupEmailError", "Email must end with @example.com");
    valid = false;
  } else {
    showError("signupEmail", "signupEmailError", "");
  }

  // Password check
  if (!validatePassword(password)) {
    showError("signupPassword", "signupPasswordError", "Password must be at least 5 characters");
    valid = false;
  } else {
    showError("signupPassword", "signupPasswordError", "");
  }

  
});

// ================== SIGN IN VALIDATION & REDIRECT ================== //
async function getUserByEmailAndPassword(email, password) {
  const response = await fetch('data.json');
  const data = await response.json();

  for (const group of ['employees', 'hr', 'managers', 'security']) {
    const user = data[group].find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      return user.type;
    }
  }
  return null;
}

document.getElementById("signInForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  let email = document.getElementById("signinEmail").value.trim();
  let password = document.getElementById("signinPassword").value.trim();
  let valid = true;

  if (!validateEmail(email)) {
    showError("signinEmail", "signinEmailError", "Email must end with @example.com");
    valid = false;
  } else {
    showError("signinEmail", "signinEmailError", "");
  }

  
  if (!validatePassword(password)) {
    showError("signinPassword", "signinPasswordError", "Password must be at least 5 characters");
    valid = false;
  } else {
    showError("signinPassword", "signinPasswordError", "");
  }

  if (valid) {
    const userType = await getUserByEmailAndPassword(email, password);
    if (userType === "employee") {
      window.location.href = "employees.html";
    } else if (userType === "manager") {
      window.location.href = "manager.html";
    } else if (userType === "hr") {
      window.location.href = "hr.html";
    } else if (userType === "security") {
      window.location.href = "security.html";
    } else {
      showError("signinEmail", "signinEmailError", "❌ Email or password is incorrect!");
      showError("signinPassword", "signinPasswordError", "");
    }
  }
});


async function getUserByEmailAndPassword(email, password) {
  const response = await fetch('data.json');
  const data = await response.json();

  for (const group of ['employees', 'hr', 'managers', 'security']) {
    const user = data[group].find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      return user.type;
    }
  }
  return null;
}

document.getElementById("signInForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  let email = document.getElementById("signinEmail").value.trim();
  let password = document.getElementById("signinPassword").value.trim();
  let valid = true;

  
  if (!validateEmail(email)) {
    showError("signinEmail", "signinEmailError", "Email must end with @example.com");
    valid = false;
  } else {
    showError("signinEmail", "signinEmailError", "");
  }

  
  if (!validatePassword(password)) {
    showError("signinPassword", "signinPasswordError", "Password must be at least 5 characters");
    valid = false;
  } else {
    showError("signinPassword", "signinPasswordError", "");
  }

  if (valid) {
    const userType = await getUserByEmailAndPassword(email, password);
    if (userType === "employee") {
      window.location.href = "employees.html";
    } else if (userType === "manager") {
      window.location.href = "managers.html";
    } else if (userType === "hr") {
      window.location.href = "hr.html";
    } else if (userType === "security") {
      window.location.href = "security.html";
    } else {
      showError("signinEmail", "signinEmailError", "❌ Email or password is incorrect!");
      showError("signinPassword", "signinPasswordError", "");
    }
  }
});