import type { ComponentChildren } from "preact";

type TooltipProps = {
  text: string;
  children: ComponentChildren;
  position?: "top" | "bottom" | "left" | "right";
  tone?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "neutral";
};

export function Tooltip({ text, children, position = "bottom", tone = "primary" }: TooltipProps) {
  return (
    <span
      class={`tooltip tooltip-${position} tooltip-${tone} inline-flex`}
      data-tip={text}
      tabIndex={0}
      aria-label={text}
    >
      <span className="cursor-help rounded-lg border border-base-300 bg-base-100 px-2 py-1 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5">
        {children}
      </span>
    </span>
  );
}
