import { useEffect, useRef, useState } from "preact/hooks";
import type { ComponentChildren, JSX } from "preact";

let sharedMeasure: HTMLDivElement | null = null;

const getMeasure = () => {
  if (typeof document === "undefined") return null;
  if (sharedMeasure) return sharedMeasure;
  sharedMeasure = document.querySelector<HTMLDivElement>(".tooltip-measure") || document.createElement("div");
  if (!sharedMeasure.classList.contains("tooltip-measure")) {
    sharedMeasure.className = "tooltip-measure";
    document.body.appendChild(sharedMeasure);
  }
  return sharedMeasure;
};

type TooltipProps = {
  text: string;
  children: ComponentChildren;
};

export function Tooltip({ text, children }: TooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [touchActive, setTouchActive] = useState(false);

  const clampTooltipShift = () => {
    const el = ref.current;
    const measure = getMeasure();
    if (!el || !measure) return;
    measure.textContent = text;
    const width = measure.getBoundingClientRect().width;
    const rect = el.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const padding = 12;
    const anchorCenter = rect.left + rect.width / 2;
    const idealLeft = anchorCenter - width / 2;
    const clampedLeft = Math.max(padding, Math.min(idealLeft, viewportWidth - padding - width));
    const shift = clampedLeft + width / 2 - anchorCenter;
    el.style.setProperty("--tooltip-shift", `${shift}px`);
    measure.textContent = "";
  };

  useEffect(() => {
    const handleClickAway = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setTouchActive(false);
      }
    };
    document.addEventListener("click", handleClickAway);
    return () => document.removeEventListener("click", handleClickAway);
  }, []);

  const handleClick = (event: JSX.TargetedMouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    const next = !touchActive;
    setTouchActive(next);
    if (next) clampTooltipShift();
  };

  const handleHover = () => clampTooltipShift();

  return (
    <span
      ref={ref}
      class={`tooltip${touchActive ? " touch-active" : ""}`}
      data-tooltip={text}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onFocus={handleHover}
      tabIndex={0}
    >
      {children}
    </span>
  );
}
