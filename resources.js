// resources page toggle arrow

let isButtonScroll = false; // Variable to track if the scroll event was triggered by a button click
let upArrow = document.querySelector(".toggle-up");

function scrollToSection(targetSection) {
  if (targetSection) {
    isButtonScroll = true; // Indicate that the following scroll event is due to a button click
    targetSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.location.hash = `#${targetSection.id}`;
    }, 500);
  }
}

function scrollToPreviousSection() {
  const sections = [...document.querySelectorAll(".main > .headspacer")];
  const currentIndex = sections.findIndex(
    (section) => section.id === window.location.hash.slice(1)
  );
  const previousSection = sections[currentIndex - 1];

  if (previousSection) {
    upArrow.style.opacity = "1"; // Make the up arrow visible
    scrollToSection(previousSection);
  } else if (currentIndex === 0) {
    scrollToSection(document.getElementById("top"));
  }
}

function scrollToNextSection() {
  const sections = [...document.querySelectorAll(".main > .headspacer")];
  let currentIndex = sections.findIndex(
    (section) => section.id === window.location.hash.slice(1)
  );

  if (currentIndex === -1) {
    // If we're at the top of the page
    currentIndex = 0; // Set currentIndex to 0 so that we scroll to the first section
  }

  const nextSection = sections[currentIndex + 1];
  if (nextSection) {
    upArrow.style.opacity = "1"; // Make the up arrow visible
    scrollToSection(nextSection);
  } else {
    scrollToSection(document.getElementById("top"));
    upArrow.style.opacity = "0"; // Make the up arrow invisible
  }
}

upArrow.style.opacity = "0"; // Hide the up arrow on initial page load

// Create an observer instance linked to the callback function
let observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        upArrow.style.opacity = "0";
      } else {
        upArrow.style.opacity = "1";
      }
    });
  },
  { threshold: 0.1 }
);

// Start observing the top element
observer.observe(document.getElementById("top"));
