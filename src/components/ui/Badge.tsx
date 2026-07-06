import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "default" && "bg-surface-muted text-gold-brand",
        variant === "success" && "bg-teal-brand/15 text-teal-brand",
        variant === "warning" && "bg-gold-brand/15 text-gold-brand",
        variant === "danger" && "bg-rose-500/15 text-rose-500",
        className,
      )}
    >
      {children}
    </span>
  );
}
