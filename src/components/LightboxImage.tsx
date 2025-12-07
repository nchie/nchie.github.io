import { useEffect, useState } from "preact/hooks";

type LightboxImageProps = {
  src: string;
  alt: string;
  caption?: string;
  width?: number | string;
};

export function LightboxImage({ src, alt, caption, width }: LightboxImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
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
          <div class="lightbox-frame" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button class="lightbox-close" aria-label="Close" type="button" onClick={close}>
              ×
            </button>
            <img src={src} alt={alt} />
            {caption && <p class="lightbox-caption">{caption}</p>}
          </div>
        </div>
      )}
    </figure>
  );
}
