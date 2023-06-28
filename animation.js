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

  const quoteFadeFactor = 2;
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
