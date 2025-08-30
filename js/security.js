// ------------------ Sidebar ------------------
const links = document.querySelectorAll(".mynav a");
const sections = document.querySelectorAll(".page-section");

links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    links.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    sections.forEach((section) => section.classList.add("d-none"));

    const route = link.getAttribute("data-route");
    document.getElementById(route).classList.remove("d-none");
  });
});