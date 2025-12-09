import { useEffect, useId, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from "@floating-ui/dom";

type Position = "top" | "bottom" | "left" | "right";
type Tone =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

type TooltipProps = {
  text: string;
  position?: Position;
  tone?: Tone;
  children: ComponentChildren;
};

const placementMap: Record<Position, Placement> = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};

const toneClass: Record<Tone, string> = {
  primary: "bg-primary text-primary-content border-primary/50",
  secondary: "bg-secondary text-secondary-content border-secondary/50",
  accent: "bg-accent text-accent-content border-accent/50",
  info: "bg-info text-info-content border-info/50",
  success: "bg-success text-success-content border-success/50",
  warning: "bg-warning text-warning-content border-warning/50",
  error: "bg-error text-error-content border-error/50",
  neutral: "bg-neutral text-neutral-content border-neutral/50",
};

export default function TooltipFloating({
  text,
  position = "bottom",
  tone = "primary",
  children,
}: TooltipProps) {
  const referenceRef = useRef<HTMLSpanElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedPlacement, setResolvedPlacement] = useState<Placement>(
    placementMap[position],
  );
  const id = useId();

  useEffect(() => {
    if (!isOpen) return;
    const referenceEl = referenceRef.current;
    const floatingEl = floatingRef.current;
    if (!referenceEl || !floatingEl) return;

    return autoUpdate(referenceEl, floatingEl, () => {
      computePosition(referenceEl, floatingEl, {
        placement: placementMap[position],
        strategy: "fixed",
        middleware: [
          offset(10),
          flip({ fallbackAxisSideDirection: "start" }),
          shift({ padding: 8 }),
          size({
            padding: 8,
            apply({ availableWidth, elements }) {
              // Prevent the tooltip from overflowing the viewport horizontally.
              elements.floating.style.maxWidth = `${
                Math.max(availableWidth, 180)
              }px`;
            },
          }),
        ],
      }).then(({ x, y, placement }) => {
        setCoords({ x, y });
        setResolvedPlacement(placement);
      });
    });
  }, [isOpen, position]);

  const show = () => setIsOpen(true);
  const hide = () => setIsOpen(false);
  const toggle = () => setIsOpen((open) => !open);

  const placementClass =
    resolvedPlacement === "top" || resolvedPlacement === "bottom"
      ? "origin-center"
      : resolvedPlacement.startsWith("left")
        ? "origin-right"
        : "origin-left";

  return (
    <span class="relative inline-flex">
      <span
        ref={referenceRef}
        tabIndex={0}
        aria-describedby={isOpen ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={toggle}
        class="cursor-help text-primary underline decoration-dashed underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
      >
        {children}
      </span>

      <div
        ref={floatingRef}
        id={id}
        role="tooltip"
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: `${coords.y}px`,
          left: `${coords.x}px`,
        }}
        class={`pointer-events-none z-50 max-w-[min(24rem,calc(100vw-2rem))] rounded-lg border px-3 py-2 text-sm leading-snug shadow-xl backdrop-blur-sm transition duration-150 ease-out ${toneClass[tone]} ${placementClass} ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {text}
      </div>
    </span>
  );
}
