// auth.js
(function () {
  if (!localStorage.getItem("loggedInUser")) {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

    window.location.replace("login.html");
  }
})();
