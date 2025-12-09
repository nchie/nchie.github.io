import { useEffect } from "preact/hooks";

type Props = {
  idBase: string;
};

export default function LightboxImageController({ idBase }: Props) {
  useEffect(() => {
    const root = document.querySelector(`[data-lightbox-root="${idBase}"]`);
    const overlay = root?.querySelector<HTMLElement>("[data-lightbox-overlay]");
    const frame = root?.querySelector<HTMLElement>("[data-lightbox-frame]");
    const trigger = root?.querySelector<HTMLElement>("[data-lightbox-trigger]");
    const closeButton = root?.querySelector<HTMLElement>("[data-lightbox-close]");
    const spinner = root?.querySelector<HTMLElement>("[data-lightbox-spinner]");
    const modalImage = frame?.querySelector<HTMLImageElement>("picture img");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!root || !overlay || !frame || !trigger || !closeButton) return;

    let lastFocused: HTMLElement | null = null;
    let previousOverflow = "";
    let closeTimeout: number | undefined;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const trapFocus = (event: KeyboardEvent) => {
      const focusable = Array.from(frame.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled"),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "Tab") {
        trapFocus(event);
      }
    };

    const showSpinner = () => {
      frame.dataset.loaded = "false";
      spinner?.classList.remove("opacity-0", "invisible");
    };

    const markLoaded = () => {
      frame.dataset.loaded = "true";
      spinner?.classList.add("opacity-0");
      window.setTimeout(() => spinner?.classList.add("invisible"), 220);
    };

    const open = () => {
      window.clearTimeout(closeTimeout);
      const active = document.activeElement;
      lastFocused = active instanceof HTMLElement ? active : null;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      overlay.classList.remove("hidden");
      overlay.dataset.state = prefersReducedMotion ? "open" : "opening";
      frame.dataset.state = prefersReducedMotion ? "open" : "opening";
      overlay.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
      frame.tabIndex = -1;
      frame.focus();

      showSpinner();
      if (modalImage?.complete) markLoaded();

      requestAnimationFrame(() => {
        overlay.dataset.state = "open";
        frame.dataset.state = "open";
      });

      document.addEventListener("keydown", onKeyDown);
      queueMicrotask(() => closeButton.focus());
    };

    const close = () => {
      window.clearTimeout(closeTimeout);
      if (prefersReducedMotion) {
        overlay.classList.add("hidden");
        overlay.dataset.state = "closed";
        frame.dataset.state = "closed";
      } else {
        overlay.dataset.state = "closing";
        frame.dataset.state = "closing";

        const finish = () => {
          overlay.classList.add("hidden");
          overlay.dataset.state = "closed";
          frame.dataset.state = "closed";
          overlay.removeEventListener("transitionend", finish);
        };

        overlay.addEventListener("transitionend", finish);
        closeTimeout = window.setTimeout(finish, 260);
      }
      overlay.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused?.focus?.();
    };

    trigger.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    modalImage?.addEventListener("load", markLoaded);
    const handleOverlayClick = (event: Event) => {
      if (event.target === overlay) close();
    };
    overlay.addEventListener("click", handleOverlayClick);

    return () => {
      trigger.removeEventListener("click", open);
      closeButton.removeEventListener("click", close);
      modalImage?.removeEventListener("load", markLoaded);
      overlay.removeEventListener("click", handleOverlayClick);
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(closeTimeout);
    };
  }, [idBase]);

  return null;
}
