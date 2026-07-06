import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "surface-input min-h-28 w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-teal-brand focus:ring-2 focus:ring-teal-brand/20",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
