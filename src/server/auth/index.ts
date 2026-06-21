import NextAuth from "next-auth";
import { cache } from "react";

import { getPreviewSession, isPreviewMode } from "@/lib/preview-mode";
import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(async () => {
  if (isPreviewMode()) {
    return getPreviewSession();
  }
  return uncachedAuth();
});

export { auth, handlers, signIn, signOut };
