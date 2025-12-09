import { useEffect, useId, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  useClick,
  useDismiss,
  useHover,
  useFocus,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const {
    refs,
    floatingStyles,
    placement,
    context,
  } = useFloating({
    placement: placementMap[position],
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "start" }),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableWidth, elements }) {
          elements.floating.style.maxWidth = `${
            Math.max(availableWidth, 180)
          }px`;
        },
      }),
    ],
    open: isOpen,
    onOpenChange: setIsOpen,
  });
  const id = useId();

  useEffect(() => {
    const markTouch = () => setIsTouch(true);
    window.addEventListener("touchstart", markTouch, { passive: true, once: true });
    return () => window.removeEventListener("touchstart", markTouch);
  }, []);

  // Close the tooltip whenever the user scrolls to avoid jank on mobile.
  useEffect(() => {
    if (!isOpen) return;
    const closeOnScroll = () => setIsOpen(false);
    window.addEventListener("scroll", closeOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeOnScroll);
  }, [isOpen]);

  const hover = useHover(context, { move: false, enabled: !isTouch });
  const focus = useFocus(context, { enabled: !isTouch });
  const click = useClick(context, { toggle: true });
  const dismiss = useDismiss(context, {
    escapeKey: true,
    outsidePress: true,
    outsidePressEvent: "pointerdown",
  });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    click,
    dismiss,
    role,
  ]);

  const placementClass =
    placement === "top" || placement === "bottom"
      ? "origin-center"
      : placement.startsWith("left")
        ? "origin-right"
        : "origin-left";

  return (
    <span class="relative inline-flex">
      <span
        ref={refs.setReference}
        tabIndex={0}
        aria-describedby={isOpen ? id : undefined}
        class="cursor-help text-primary underline decoration-dashed underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
        {...getReferenceProps()}
      >
        {children}
      </span>

      <div
        ref={refs.setFloating}
        id={id}
        role="tooltip"
        aria-hidden={!isOpen}
        style={floatingStyles}
        class={`pointer-events-none z-50 max-w-[min(24rem,calc(100vw-2rem))] rounded-lg border px-3 py-2 text-sm leading-snug shadow-xl backdrop-blur-sm transition duration-150 ease-out ${toneClass[tone]} ${placementClass} ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        {...getFloatingProps()}
      >
        {text}
      </div>
    </span>
  );
}
