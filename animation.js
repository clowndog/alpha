// scroll to top of page on reload

window.addEventListener("beforeunload", function () {
  window.scrollTo(0, 0);
});

// Code for greeting animation

window.addEventListener("load", () => {
  const greeting = document.getElementById("animation");
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

  const fadeFactor = 2.5;
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const newOpacity = Math.max(1 - (scrolled / windowHeight) * fadeFactor, 0);
    greeting.style.opacity = newOpacity;
  });
});

function cubicEaseInOut(t) {
  if ((t /= 0.5) < 1) return 0.5 * Math.pow(t, 3);
  return 0.5 * (Math.pow(t - 2, 3) + 2);
}
