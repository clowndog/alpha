// navigation

const openNav = () => {
  document.getElementById("mySidebar").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidebar").style.width = "0";
};

const expandResources = () => {
  const resourcesDiv = document.getElementById("resources");
  const resourcesArrow = document.querySelector(".resources-arrow");
  resourcesDiv.style.display =
    resourcesDiv.style.display === "none" ? "block" : "none";
  resourcesArrow.classList.toggle("expanded");
};

const toggleArrow = () => {
  const arrow = document.querySelector(".arrow");
  arrow.classList.toggle("expanded");
};
