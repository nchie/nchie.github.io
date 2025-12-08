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
    <figure class="my-6 space-y-3">
      <img
        src={src}
        alt={alt}
        width={width}
        onClick={() => setOpen(true)}
        class="w-full cursor-zoom-in rounded-xl border border-base-300 object-contain shadow-md transition hover:-translate-y-0.5"
        loading="lazy"
      />
      {caption && <figcaption class="text-center text-sm text-base-content/70">{caption}</figcaption>}

      {open && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={close}>
          <div
            class="relative z-10 max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={caption || alt}
            aria-describedby={caption ? captionIdRef.current : undefined}
            ref={frameRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2 border border-base-300"
              aria-label="Close"
              type="button"
              onClick={close}
              ref={closeButtonRef}
            >
              ×
            </button>
            <img class="max-h-[70vh] w-full rounded-xl object-contain" src={src} alt={alt} />
            {caption && (
              <p id={captionIdRef.current} class="mt-2 text-center text-sm text-base-content/70">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
