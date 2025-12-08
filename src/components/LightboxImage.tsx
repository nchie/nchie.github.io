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

    if (!root || !overlay || !frame || !trigger || !closeButton) return;

    let lastFocused: HTMLElement | null = null;
    let previousOverflow = "";

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

    const open = () => {
      const active = document.activeElement;
      lastFocused = active instanceof HTMLElement ? active : null;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      overlay.classList.remove("hidden");
      overlay.setAttribute("aria-hidden", "false");
      frame.tabIndex = -1;
      frame.focus();

      document.addEventListener("keydown", onKeyDown);
      queueMicrotask(() => closeButton.focus());
    };

    const close = () => {
      overlay.classList.add("hidden");
      overlay.setAttribute("aria-hidden", "true");
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused?.focus?.();
    };

    trigger.addEventListener("click", open);
    closeButton.addEventListener("click", close);
    const handleOverlayClick = (event: Event) => {
      if (event.target === overlay) close();
    };
    overlay.addEventListener("click", handleOverlayClick);

    return () => {
      trigger.removeEventListener("click", open);
      closeButton.removeEventListener("click", close);
      overlay.removeEventListener("click", handleOverlayClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [idBase]);

  return null;
}
