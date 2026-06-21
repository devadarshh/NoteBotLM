import { isPreviewMode } from "@/lib/preview-mode";

export function PreviewBanner() {
  if (!isPreviewMode()) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] -translate-x-1/2">
      <div className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-xs font-medium shadow-lg">
        Preview mode — browsing without login (local only)
      </div>
    </div>
  );
}
