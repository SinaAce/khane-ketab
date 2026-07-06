import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "surface-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/20",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
