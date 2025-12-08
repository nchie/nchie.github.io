import type { ComponentChildren } from "preact";

type TooltipProps = {
  text: string;
  children: ComponentChildren;
  position?: "top" | "bottom" | "left" | "right";
  tone?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "neutral";
};

export function Tooltip({ text, children, position = "bottom", tone = "primary" }: TooltipProps) {
  // Use concrete class names so Tailwind/DaisyUI generate the variant CSS.
  const toneClass: Record<NonNullable<TooltipProps["tone"]>, string> = {
    primary: "tooltip-primary",
    secondary: "tooltip-secondary",
    accent: "tooltip-accent",
    info: "tooltip-info",
    success: "tooltip-success",
    warning: "tooltip-warning",
    error: "tooltip-error",
    neutral: "tooltip-neutral",
  };

  const positionClass: Record<NonNullable<TooltipProps["position"]>, string> = {
    top: "tooltip-top",
    bottom: "tooltip-bottom",
    left: "tooltip-left",
    right: "tooltip-right",
  };

  return (
    <span class={`tooltip ${positionClass[position]} ${toneClass[tone]} inline-flex`} tabIndex={0} aria-label={text}>
      <span className="tooltip-content">{text}</span>
      <span className="cursor-help text-primary underline decoration-dashed underline-offset-4 transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40">
        {children}
      </span>
    </span>
  );
}
