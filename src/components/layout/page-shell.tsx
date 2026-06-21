import { cn } from "@/lib/utils";
import { AppHeader } from "@/components/layout/app-header";

interface PageShellProps {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  narrow?: boolean;
  className?: string;
}

export function PageShell({
  children,
  backHref,
  backLabel,
  narrow = false,
  className,
}: PageShellProps) {
  return (
    <div className="page-grid-bg bg-background min-h-screen">
      <AppHeader backHref={backHref} backLabel={backLabel} />
      <main
        className={cn(
          "mx-auto px-4 py-10 sm:px-6 lg:px-8",
          narrow ? "max-w-3xl" : "max-w-6xl",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
