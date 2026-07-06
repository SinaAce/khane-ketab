import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <div
      className={cn(
        "page-shell mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8",
        narrow && "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
