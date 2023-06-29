// scroll to top of page on reload

window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});

// greeting animation

window.addEventListener("load", () => {
  const greeting = document.getElementById("animation");
  const quote = document.querySelector(".quote");
  let opacity = 0;
  const duration = 2600;
  let start = null;
  const fadeIn = (timestamp) => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const easingProgress = cubicEaseInOut(progress / duration);
    opacity = easingProgress;
    greeting.style.opacity = opacity > 1 ? 1 : opacity;
    if (progress < duration) {
      window.requestAnimationFrame(fadeIn);
    }
  };
  window.requestAnimationFrame(fadeIn);

  const quoteFadeFactor = 1.5;
  const fadeFactor = 2.5;
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const quoteOpacity = Math.max(
      (scrolled / windowHeight) * quoteFadeFactor,
      0
    );
    const otherOpacity = Math.max((scrolled / windowHeight) * fadeFactor, 0);
    quote.style.opacity = quoteOpacity > 1 ? 1 : quoteOpacity;
  });
});

function cubicEaseInOut(t) {
  if ((t /= 0.5) < 1) return 0.5 * Math.pow(t, 3);
  return 0.5 * (Math.pow(t - 2, 3) + 2);
}

// darken video

window.addEventListener("load", () => {
  const videoBg = document.getElementById("video-bg");
  const windowHeight = window.innerHeight;
  const fadeFactor = 1.5;

  function adjustVideoOpacity() {
    const scrolled = window.pageYOffset;
    const scrollRatio = scrolled / windowHeight;
    const newOpacity = Math.max(1 - scrollRatio * fadeFactor, 0);
    videoBg.style.opacity = newOpacity.toString();
  }

  adjustVideoOpacity();

  window.addEventListener("scroll", adjustVideoOpacity);
});

//content circle animation

window.addEventListener("scroll", function () {
  let links = document.getElementById("future-content-links");
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
    links.style.opacity = "1";
  }
});

window.addEventListener("scroll", () => {
  const scrollHeight = window.pageYOffset;
  const docHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  if (scrollHeight === docHeight) {
    const circles = document.querySelectorAll(".circle");
    circles.forEach((circle) => {
      circle.style.opacity = "1";
    });
  }
});

// resources page toggle arrow

let isProgrammaticScroll = false;

window.addEventListener("scroll", () => {
  if (!isProgrammaticScroll && window.scrollY === 0) {
    document.querySelector(".toggle-up").style.opacity = "0";
  }
  isProgrammaticScroll = false;
});

function scrollToPreviousSection() {
  const sections = [...document.querySelectorAll(".main > .headspacer")];
  const currentIndex = sections.findIndex(
    (section) => section.id === window.location.hash.slice(1)
  );
  const previousSection = sections[currentIndex - 1];
  const upArrow = document.querySelector(".toggle-up");

  if (previousSection) {
    const previousId = previousSection.id;
    previousSection.id = "";
    isProgrammaticScroll = true;
    previousSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.location.hash = `#${previousId}`;
      previousSection.id = previousId;
    }, 500);
    upArrow.style.opacity = "1"; // Make the up arrow visible
  } else if (currentIndex === 0) {
    const topElement = document.getElementById("top");
    topElement.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.location.hash = "#top";
    }, 500);
  }
}

function scrollToNextSection() {
  const sections = [...document.querySelectorAll(".main > .headspacer")];
  let currentIndex = sections.findIndex(
    (section) => section.id === window.location.hash.slice(1)
  );
  const upArrow = document.querySelector(".toggle-up");

  if (currentIndex === -1) {
    // If we're at the top of the page
    currentIndex = 0; // Set currentIndex to 0 so that we scroll to the first section
  }

  const nextSection = sections[currentIndex + 1];
  if (nextSection) {
    const nextId = nextSection.id;
    nextSection.id = "";
    nextSection.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.location.hash = `#${nextId}`;
      nextSection.id = nextId;
    }, 500);
    upArrow.style.opacity = "1"; // Make the up arrow visible
  } else {
    const topElement = document.getElementById("top");
    topElement.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      window.location.hash = "#top";
    }, 500);
    upArrow.style.opacity = "0"; // Make the up arrow invisible
  }
}

document.querySelector(".toggle-up").style.opacity = "0";
