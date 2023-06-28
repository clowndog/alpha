// navigation

const openNav = () => {
  document.getElementById("mySidebar").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidebar").style.width = "0";
};

const expandResources = () => {
  const resourcesDiv = document.getElementById("resources");
  const resourcesArrow = document.querySelector(".arrow");
  resourcesDiv.style.display =
    resourcesDiv.style.display === "none" ? "block" : "none";
  resourcesArrow.classList.toggle("expanded");
};
