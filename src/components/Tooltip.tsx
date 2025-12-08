import { useState } from "preact/hooks";
import type { ComponentChildren } from "preact";

type TooltipProps = {
  text: string;
  children: ComponentChildren;
};

export function Tooltip({ text, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <span
      class={`tooltip tooltip-bottom ${open ? "tooltip-open" : ""}`}
      data-tip={text}
      onClick={(event) => {
        event.preventDefault();
        toggle();
      }}
      onMouseLeave={close}
      onBlur={close}
      tabIndex={0}
    >
      <span class="cursor-help rounded-lg border border-base-300 bg-base-100 px-2 py-1 text-sm font-semibold text-primary shadow-sm transition hover:-translate-y-0.5">
        {children}
      </span>
    </span>
  );
}
