import type { Session } from "next-auth";

export const PREVIEW_USER = {
  id: "preview-user-id",
  name: "Alex Preview",
  email: "preview@localhost.dev",
  image: null,
} as const;

/** Local UI preview only — disabled in production regardless of env value. */
export function isPreviewMode(): boolean {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.PREVIEW_MODE === "true"
  );
}

export function getPreviewSession(): Session {
  return {
    user: { ...PREVIEW_USER },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
