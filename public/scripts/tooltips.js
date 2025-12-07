document.addEventListener("DOMContentLoaded", () => {
  // Hidden measurer to clamp tooltip width within viewport.
  const measure = document.createElement("div");
  measure.className = "tooltip-measure";
  document.body.appendChild(measure);

  const clampTooltipShift = (el) => {
    const text = el.getAttribute("data-tooltip") || "";
    measure.textContent = text;
    const width = measure.getBoundingClientRect().width;
    const rect = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const padding = 12; // space from viewport edges
    const anchorCenter = rect.left + rect.width / 2;
    const idealLeft = anchorCenter - width / 2;
    const clampedLeft = Math.max(padding, Math.min(idealLeft, viewportWidth - padding - width));
    const shift = clampedLeft + width / 2 - anchorCenter;
    el.style.setProperty("--tooltip-shift", `${shift}px`);
    measure.textContent = "";
  };

  // Enable touch-to-toggle on tooltips for mobile while keeping hover on desktop.
  document.querySelectorAll(".tooltip").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      clampTooltipShift(el);
      const wasActive = el.classList.contains("touch-active");
      document.querySelectorAll(".tooltip.touch-active").forEach((tip) => tip.classList.remove("touch-active"));
      if (!wasActive) {
        el.classList.add("touch-active");
      }
    });

    el.addEventListener("mouseenter", () => clampTooltipShift(el));
    el.addEventListener("focus", () => clampTooltipShift(el));
  });

  // Close tooltip when tapping elsewhere.
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".tooltip")) {
      document.querySelectorAll(".tooltip.touch-active").forEach((tip) => tip.classList.remove("touch-active"));
    }
  });
});
