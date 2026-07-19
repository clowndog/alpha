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

window.expandResources = () => {
  const resourcesDiv = document.getElementById("resources");
  const resourcesArrow = document.querySelector(".arrow");
  if (!resourcesDiv || !resourcesArrow) return;

  resourcesDiv.style.display =
    resourcesDiv.style.display === "none" ? "block" : "none";
  resourcesArrow.classList.toggle("expanded");
};

document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.querySelector(".openbtn");
  const closeButton = document.querySelector(".closebtn");
  const resourcesButton = document.getElementById("arrow");

  if (openButton) {
    openButton.removeAttribute("onclick");
    openButton.addEventListener("click", window.openNav);
  }

  if (closeButton) {
    closeButton.removeAttribute("onclick");
    closeButton.addEventListener("click", window.closeNav);
  }

  if (resourcesButton) {
    resourcesButton.removeAttribute("onclick");
    resourcesButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.expandResources();
    });
  }
});
