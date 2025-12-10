import type { ImageMetadata } from "astro";
import type { ComponentChildren } from "preact";
import { useEffect, useId, useRef, useState } from "preact/hooks";

type Props = {
  src: ImageMetadata;
  alt: string;
  caption?: string;
  widths?: number[];
  modalWidths?: number[];
  priority?: boolean;
  zoomable?: boolean;
  zoomLevel?: number;
  idBase?: string;
  fullSrc?: string;
  fullWidth?: number;
  fullHeight?: number;
  children?: ComponentChildren;
};

type Phase = "closed" | "opening" | "open" | "closing";

const focusableSelector =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function LightboxImage({
  src,
  alt,
  caption,
  widths: _widths = [640, 960, 1280, 1600],
  modalWidths: _modalWidths = [960, 1280, 1600, 2048],
  priority = false,
  zoomable = true,
  zoomLevel = 2,
  idBase: providedId,
  fullSrc,
  fullWidth,
  fullHeight,
  children,
}: Props) {
  const idBase = providedId ?? useId().replace(/[:]/g, "");
  const captionId = caption ? `${idBase}-caption` : undefined;
  const overlayId = `${idBase}-overlay`;
  const frameId = `${idBase}-frame`;
  const triggerId = `${idBase}-trigger`;
  const closeId = `${idBase}-close`;

  const [phase, setPhase] = useState<Phase>("closed");
  const [loaded, setLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalImageRef = useRef<HTMLImageElement | null>(null);
  const zoomContainerRef = useRef<HTMLDivElement | null>(null);
  const previousOverflow = useRef<string>("");
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const longPressTimer = useRef<number>();
  const rafIdRef = useRef<number>();
  const pendingPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const overlayVisible = phase !== "closed";
  const overlayState = phase;
  const frameState = phase;

  useEffect(() => {
    if (!overlayVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (zoomActive) {
          resetZoom();
          return;
        }
        close();
      } else if (event.key === "Tab") {
        trapFocus(event);
      }
    };

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    queueMicrotask(() => closeRef.current?.focus());

    if (zoomable) {
      if (modalImageRef.current?.complete) setLoaded(true);
      else setLoaded(false);
    } else {
      setLoaded(true);
    }

    if (!prefersReducedMotion && phase === "opening") {
      requestAnimationFrame(() => setPhase("open"));
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow.current;
      lastFocusedRef.current?.focus?.();
    };
  }, [overlayVisible, zoomActive, zoomable, prefersReducedMotion, phase]);

  const trapFocus = (event: KeyboardEvent) => {
    const frame = frameRef.current;
    if (!frame) return;
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

  const open = () => {
    setZoomActive(false);
    if (!zoomable) setLoaded(true);
    setPhase(prefersReducedMotion ? "open" : "opening");
  };

  const close = () => {
    setZoomActive(false);
    if (prefersReducedMotion) {
      setPhase("closed");
    } else {
      setPhase("closing");
      window.setTimeout(() => setPhase("closed"), 260);
    }
    document.body.style.overflow = previousOverflow.current;
  };

  const handleImageLoad = () => setLoaded(true);

  const resetZoom = () => {
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = undefined;
    setZoomActive(false);
  };

  const setZoomFromPoint = (clientX: number, clientY: number) => {
    const container = zoomContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const handleMouseEnter = (event: MouseEvent) => {
    if (!zoomable) return;
    setZoomActive(true);
    pendingPointRef.current = { x: event.clientX, y: event.clientY };
    startRafLoop();
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!zoomable || !zoomActive) return;
    pendingPointRef.current = { x: event.clientX, y: event.clientY };
    startRafLoop();
  };

  const handleMouseLeave = () => {
    stopRafLoop();
    resetZoom();
  };

  const preventContextMenu = (event: Event) => {
    event.preventDefault();
  };

  const startLongPress = (event: TouchEvent) => {
    if (!zoomable) return;
    const touch = event.touches[0];
    if (!touch) return;
    longPressTimer.current = window.setTimeout(() => {
      setZoomActive(true);
      setZoomFromPoint(touch.clientX, touch.clientY);
    }, 220);
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    if (zoomActive) setZoomFromPoint(touch.clientX, touch.clientY);
  };

  const endTouch = () => resetZoom();

  const handleZoomKeyDown = (event: KeyboardEvent) => {
    if (!zoomable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setZoomActive((active) => !active);
    } else if (event.key === "Escape" && zoomActive) {
      event.preventDefault();
      resetZoom();
    }
  };

  const startRafLoop = () => {
    if (rafIdRef.current != null) return;
    const tick = () => {
      const point = pendingPointRef.current;
      if (point) {
        setZoomFromPoint(point.x, point.y);
        pendingPointRef.current = null;
      }
      rafIdRef.current = window.requestAnimationFrame(tick);
    };
    rafIdRef.current = window.requestAnimationFrame(tick);
  };

  const stopRafLoop = () => {
    if (rafIdRef.current != null) {
      window.cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = undefined;
    }
    pendingPointRef.current = null;
  };

  const overlayClasses =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-200 ease-out";
  const overlayStateClasses =
    "data-[state=open]:opacity-100 data-[state=open]:pointer-events-auto data-[state=opening]:opacity-100 data-[state=opening]:pointer-events-auto opacity-0 pointer-events-none";

  const frameClasses =
    "relative w-[92vw] max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-4 shadow-2xl outline-none opacity-0 scale-95 transition duration-200 ease-out focus-visible:ring focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100";
  const frameStateClasses = "data-[state=open]:opacity-100 data-[state=open]:scale-100";

  return (
    <figure class="mx-auto w-full max-w-3xl" data-lightbox-root={idBase}>
      <button
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-controls={overlayId}
        aria-expanded={overlayVisible ? "true" : "false"}
        class="block w-full text-left focus:outline-none focus:ring focus:ring-primary"
      data-lightbox-trigger
      onClick={open}
      ref={triggerRef}
      onContextMenu={preventContextMenu}
    >
      {children ?? (
        <img
          src={src.src}
          alt={alt}
          width={src.width}
          height={src.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={priority ? "high" : "auto"}
          class="w-full cursor-zoom-in rounded-xl border border-base-300 object-contain shadow-md transition hover:-translate-y-0.5"
          draggable={false}
          style={{ WebkitTouchCallout: "none" }}
        />
      )}
    </button>

      {caption && <figcaption class="text-center text-sm text-base-content/70">{caption}</figcaption>}

      {overlayVisible && (
        <div
          id={overlayId}
          role="dialog"
          aria-modal="true"
          aria-label={caption || alt}
          aria-describedby={captionId}
          aria-hidden={overlayVisible ? "false" : "true"}
          data-state={overlayState}
          class={`${overlayClasses} ${overlayStateClasses}`}
          data-lightbox-overlay
          ref={overlayRef}
          onClick={(event) => {
            if (event.target === overlayRef.current) close();
          }}
        >
          <div
            id={frameId}
            data-state={frameState}
            data-loaded={loaded ? "true" : "false"}
            class={`${frameClasses} ${frameStateClasses}`}
            data-lightbox-frame
            ref={frameRef}
            tabIndex={-1}
          >
            <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-2 px-4 py-3">
              {zoomable && (
                <span
                  class="pointer-events-none inline-flex items-center gap-1 rounded-full bg-base-100/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-base-content/80 shadow-sm backdrop-blur"
                >
                  <span aria-hidden="true">🔍</span>
                  Zoom
                </span>
              )}
              <button
                id={closeId}
                class="btn btn-circle btn-ghost btn-sm border border-base-300 pointer-events-auto"
                aria-label="Close"
                type="button"
                data-lightbox-close
                onClick={close}
                ref={closeRef}
              >
                ×
              </button>
            </div>

            <div
              data-lightbox-spinner
              class={`pointer-events-none absolute inset-0 grid place-items-center text-base-content/70 transition-opacity duration-200 ${loaded ? "opacity-0 invisible" : ""}`}
              aria-live="polite"
              aria-atomic="true"
            >
              <span class="loading loading-spinner loading-lg" aria-hidden="true"></span>
              <span class="sr-only">Loading full-size image…</span>
            </div>

            <div
              data-zoom-container
              data-zoomable={zoomable ? "true" : "false"}
              data-zoom-state={zoomActive ? "active" : "idle"}
              data-zoom-level={zoomLevel}
              class="group relative isolate flex max-h-[82vh] w-full items-center justify-center overflow-hidden rounded-xl bg-base-200/60 outline-none ring-primary/60 transition focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 motion-reduce:transition-none mt-10 md:mt-12"
              tabIndex={zoomable ? 0 : -1}
              role={zoomable ? "button" : undefined}
              aria-label={zoomable ? "Toggle zoom" : undefined}
              aria-pressed={zoomable ? (zoomActive ? "true" : "false") : undefined}
              data-zoom-target
              ref={zoomContainerRef}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onKeyDown={handleZoomKeyDown}
              onTouchStart={startLongPress}
              onTouchMove={handleTouchMove}
              onTouchEnd={endTouch}
              onTouchCancel={endTouch}
              onContextMenu={preventContextMenu}
            >
              <img
                src={fullSrc ?? src.src}
                alt={alt}
                width={fullWidth ?? src.width}
                height={fullHeight ?? src.height}
                loading="lazy"
                decoding="async"
                data-zoom-image
                ref={modalImageRef}
                onLoad={handleImageLoad}
                onContextMenu={preventContextMenu}
                class={`select-none rounded-xl ${
                  zoomable ? "transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none" : ""
                }`}
                style={
                  zoomable && zoomActive
                    ? {
                        width: `${zoomLevel * 100}%`,
                        maxWidth: "none",
                        height: "auto",
                        maxHeight: "none",
                        transform: `translate(${((50 - zoomOrigin.x) * (zoomLevel - 1)) / zoomLevel}%, ${(
                          (50 - zoomOrigin.y) *
                          (zoomLevel - 1)
                        ) / zoomLevel}%)`,
                        objectFit: "contain",
                        WebkitTouchCallout: "none",
                      }
                    : {
                        width: "100%",
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: "82vh",
                        objectFit: "contain",
                        WebkitTouchCallout: "none",
                      }
                }
                draggable={false}
              />
            </div>

            {caption && (
              <p id={captionId} class="mt-2 text-center text-sm text-base-content/70">
                {caption}
              </p>
            )}
          </div>
        </div>
      )}
    </figure>
  );
}
