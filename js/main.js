const loggedIn = JSON.parse(localStorage.getItem("loggedInUser"));
let role = loggedIn?.role?.toLowerCase();

$(function () {
  if (!loggedIn) {
    window.location.replace("/login.html");
  }
  document.querySelector(".logout").addEventListener("click", (e) => {
    e.preventDefault();
    console.log("log out");
    localStorage.removeItem("loggedInUser");
    window.location.replace("/login.html");
  });

  setTheme();
});

function setTheme() {
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
  $("#user-name").text(loggedIn.name);
}
