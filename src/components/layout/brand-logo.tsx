import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  variant?: "default" | "inverse";
  className?: string;
}

const sizeMap = {
  sm: { mark: "h-7 w-7 text-xs", title: "text-sm", tagline: "text-[11px]" },
  md: { mark: "h-8 w-8 text-sm", title: "text-base", tagline: "text-xs" },
  lg: { mark: "h-10 w-10 text-base", title: "text-xl", tagline: "text-sm" },
};

export function BrandLogo({
  size = "md",
  showTagline = false,
  variant = "default",
  className,
}: BrandLogoProps) {
  const s = sizeMap[size];
  const inverse = variant === "inverse";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg font-display italic",
          s.mark,
          inverse
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        N
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-display leading-none",
            s.title,
            inverse ? "text-primary-foreground" : "text-foreground",
          )}
        >
          NoteBot{" "}
          <span
            className={cn(
              "not-italic",
              inverse ? "text-primary-foreground/70" : "text-accent",
            )}
          >
            LM
          </span>
        </p>
        {showTagline && (
          <p
            className={cn(
              "mt-0.5",
              s.tagline,
              inverse ? "text-primary-foreground/50" : "text-muted-foreground",
            )}
          >
            AI research assistant
          </p>
        )}
      </div>
    </div>
  );
}
