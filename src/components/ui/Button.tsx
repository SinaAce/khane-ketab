import { buttonInteraction } from "@/lib/button-styles";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent" | "hero";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium shadow-sm",
          buttonInteraction,
          variant === "primary" &&
            "border border-transparent bg-teal-brand text-white hover:border-gold-brand/60 hover:bg-teal-brand/90 hover:shadow-teal-brand/25",
          variant === "secondary" &&
            "surface-input border border-border-persian hover:border-gold-brand/50 hover:bg-surface hover:text-teal-brand",
          variant === "ghost" &&
            "border border-transparent shadow-none hover:border-border-persian hover:bg-surface-muted",
          variant === "danger" &&
            "border border-transparent bg-rose-600 text-white hover:border-rose-300/50 hover:bg-rose-500 hover:shadow-rose-500/25",
          variant === "accent" &&
            "border border-transparent bg-amber-500 text-stone-900 hover:border-gold-brand/70 hover:bg-amber-400 hover:shadow-amber-500/30",
          variant === "hero" &&
            "border border-teal-300/40 bg-teal-900/40 text-white hover:border-gold-brand/70 hover:bg-teal-brand hover:text-white hover:shadow-teal-brand/30",
          size === "sm" && "min-h-[2.75rem] px-3 py-1.5 text-sm sm:min-h-0",
          size === "md" && "min-h-[2.75rem] px-4 py-2 text-sm sm:min-h-0",
          size === "lg" && "min-h-[3rem] px-5 py-3 text-base sm:min-h-0",
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
