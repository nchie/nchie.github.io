import { useEffect, useRef, useState } from "preact/hooks";

type LightboxImageProps = {
  src: string;
  alt: string;
  caption?: string;
  width?: number | string;
};

export function LightboxImage({ src, alt, caption, width }: LightboxImageProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const captionIdRef = useRef(`lightbox-caption-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const frame = frameRef.current;
      if (!frame) return;
      const focusable = Array.from(
        frame.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => closeButtonRef.current?.focus(), 0);

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <figure>
      <img
        src={src}
        alt={alt}
        width={width}
        onClick={() => setOpen(true)}
        style="cursor: zoom-in;"
        loading="lazy"
      />
      {caption && <figcaption>{caption}</figcaption>}

      {open && (
        <div class="lightbox-overlay open" onClick={close}>
          <div class="lightbox-backdrop" />
          <div
            class="lightbox-frame"
            role="dialog"
            aria-modal="true"
            aria-label={caption || alt}
            aria-describedby={caption ? captionIdRef.current : undefined}
            ref={frameRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button class="lightbox-close" aria-label="Close" type="button" onClick={close} ref={closeButtonRef}>
              ×
            </button>
            <img src={src} alt={alt} />
            {caption && (
              <p id={captionIdRef.current} class="lightbox-caption">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
