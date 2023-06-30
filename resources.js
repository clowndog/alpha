// resources page toggle arrow

let isButtonScroll = false;
let upArrow = document.querySelector(".toggle-up");

function scrollToSection(targetSection) {
    if (targetSection) {
        isButtonScroll = true;
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
        upArrow.style.opacity = "1";
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
        currentIndex = 0;
    }

    const nextSection = sections[currentIndex + 1];
    if (nextSection) {
        upArrow.style.opacity = "1";
        scrollToSection(nextSection);
    } else {
        scrollToSection(document.getElementById("top"));
        upArrow.style.opacity = "0";
    }
}

upArrow.style.opacity = "0";

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

observer.observe(document.getElementById("top"));
