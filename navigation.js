// navigation

window.openNav = () => {
  const sidebar = document.getElementById("mySidebar");
  const openButton = document.querySelector(".openbtn");
  if (!sidebar || !openButton) return;

  if (sidebar.classList.contains("is-open")) {
    sidebar.classList.remove("is-open");
    openButton.classList.remove("nav-open");
    return;
  }
  sidebar.classList.add("is-open");
  openButton.classList.add("nav-open");
};

window.closeNav = (event) => {
  if (event) event.preventDefault();

  const sidebar = document.getElementById("mySidebar");
  const openButton = document.querySelector(".openbtn");
  if (!sidebar || !openButton) return;

  sidebar.classList.remove("is-open");
  openButton.classList.remove("nav-open");
};

window.toggleNavGroup = (groupId, arrowId) => {
  const navGroup = document.getElementById(groupId);
  const navArrow = document.getElementById(arrowId);
  if (!navGroup || !navArrow) return;

  navGroup.classList.toggle("expanded");
  navArrow.classList.toggle("expanded");
};

window.expandResources = () => {
  window.toggleNavGroup("resources", "resources-arrow");
};

document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.querySelector(".openbtn");
  const closeButton = document.querySelector(".closebtn");
  const navToggles = document.querySelectorAll(".nav-toggle");

  if (openButton) {
    openButton.removeAttribute("onclick");
    openButton.addEventListener("click", window.openNav);
  }

  if (closeButton) {
    closeButton.removeAttribute("onclick");
    closeButton.addEventListener("click", window.closeNav);
  }

  navToggles.forEach((navToggle) => {
    navToggle.removeAttribute("onclick");
    navToggle.addEventListener("click", (event) => {
      event.preventDefault();
      window.toggleNavGroup(navToggle.dataset.target, navToggle.dataset.arrow);
    });
  });
});
