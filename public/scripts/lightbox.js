document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.style.display = "none";
  overlay.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-frame">
      <button class="lightbox-close" aria-label="Close">×</button>
      <img alt="" />
      <p class="lightbox-caption"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector("img");
  const caption = overlay.querySelector(".lightbox-caption");
  const closeBtn = overlay.querySelector(".lightbox-close");

  const open = (source, text) => {
    img.src = source;
    caption.textContent = text || "";
    overlay.classList.add("open");
    overlay.style.display = "flex";
  };

  const close = () => {
    overlay.classList.remove("open");
    overlay.style.display = "none";
    img.src = "";
    caption.textContent = "";
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("lightbox-backdrop")) {
      close();
    }
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) {
      close();
    }
  });

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const src = el.getAttribute("data-lightbox-src") || el.src || el.href;
      const text = el.getAttribute("data-lightbox-caption") || el.alt || "";
      if (src) open(src, text);
    });
  });
});
