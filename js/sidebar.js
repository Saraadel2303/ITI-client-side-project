const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let role = loggedInUser?.role?.toLowerCase();

$(function () {
  $("body").hasClass("dark-theme");
  const theme = localStorage.getItem("theme");
  if (theme == "dark") {
    $("body").addClass("dark-theme");
    $("#toggleTheme").html('<i class="bi bi-sun me-2"></i>Light Mode');
  } else {
    $("body").removeClass("dark-theme");
    $("#toggleTheme").html('<i class="bi bi-moon-stars me-2"></i>Dark Mode');
  }
  $("#toggleTheme").on("click", function (e) {
    e.preventDefault();
    $("body").toggleClass("dark-theme");
    if ($("body").hasClass("dark-theme")) {
      localStorage.setItem("theme", "dark");
      $(this).html('<i class="bi bi-sun me-2"></i>Light Mode');
    } else {
      localStorage.setItem("theme", "light");
      $(this).html('<i class="bi bi-moon-stars me-2"></i>Dark Mode');
    }
  });
  $("#user-name").text(loggedInUser.name);
});

if (role !== "security") {
  attendance.style.display = "none";
} else {
  attendance.style.display = "";
}

if (role !== "employee") {
  my_attendance.style.display = "none";
  req.style.display = "none";
} else {
  my_attendance.style.display = "";
  req.style.display = "";
}

if (role !== "manger") {
  team_tasks.style.display = "none";
  team_attendance.style.display = "none";
  approval.style.display = "none";
} else {
  team_tasks.style.display = "";
  team_attendance.style.display = "";
  approval.style.display = "";
}

if (role !== "hr") {
  settings.style.display = "none";
} else {
  settings.style.display = "";
}

const currentPage = window.location.pathname.split("/").pop();

// Loop through all sidebar links
document.querySelectorAll("#sidebar .nav-link").forEach((link) => {
  const linkPage = link.getAttribute("href");

  if (linkPage === currentPage) {
    link.classList.add("active");

    // If inside an accordion, also open parent
    const parentCollapse = link.closest(".accordion-collapse");
    if (parentCollapse) {
      parentCollapse.classList.add("show");
      const parentButton =
        parentCollapse.previousElementSibling.querySelector(
          ".accordion-button"
        );
      if (parentButton) parentButton.classList.remove("collapsed");
    }
  } else {
    link.classList.remove("active"); // remove active from other links
  }
});
