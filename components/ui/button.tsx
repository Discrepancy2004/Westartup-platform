import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover disabled:opacity-50 shadow-sm hover:shadow-[0_0_18px_rgba(45,212,191,0.28)]",
  secondary:
    "border border-border bg-surface text-ink hover:bg-canvas disabled:opacity-50 hover:shadow-md",
  ghost: "text-ink-secondary hover:text-ink hover:bg-canvas/60 disabled:opacity-50",
  danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-medium",
        "transition-[transform,box-shadow,background-color,color] duration-200 ease-out",
        "hover:scale-[1.02] active:scale-95",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
