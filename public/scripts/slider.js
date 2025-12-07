document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll("figure[data-slider]");
  sliders.forEach((figure) => {
    const images = Array.from(figure.querySelectorAll("img"));
    if (images.length < 2) return;

    let index = 0;

    const controls = document.createElement("div");
    controls.className = "slider-controls";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "slider-nav prev";
    prev.setAttribute("aria-label", "Previous image");
    prev.textContent = "‹";

    const next = document.createElement("button");
    next.type = "button";
    next.className = "slider-nav next";
    next.setAttribute("aria-label", "Next image");
    next.textContent = "›";

    const dots = document.createElement("div");
    dots.className = "slider-dots";

    images.forEach((img, i) => {
      img.dataset.slide = String(i);
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Go to image ${i + 1}`);
      dot.addEventListener("click", () => setIndex(i));
      dots.appendChild(dot);
    });

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);
    figure.appendChild(controls);

    function setIndex(nextIndex) {
      index = (nextIndex + images.length) % images.length;
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
      dots.querySelectorAll(".slider-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    prev.addEventListener("click", () => setIndex(index - 1));
    next.addEventListener("click", () => setIndex(index + 1));

    setIndex(0);
  });
});
