"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/layout/brand-logo";
import { BookOpen, Brain, FileSearch } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Document intelligence",
    description: "Upload PDFs and ask questions grounded in your sources.",
  },
  {
    icon: Brain,
    title: "Adaptive quizzes",
    description: "Generate practice tests tailored to your course material.",
  },
  {
    icon: BookOpen,
    title: "Research chat",
    description: "Explore topics with citations linked back to your documents.",
  },
];

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen">
      {/* Brand panel */}
      <div className="bg-primary text-primary-foreground relative hidden w-[45%] flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative">
          <BrandLogo size="lg" showTagline variant="inverse" />
        </div>

        <div className="relative space-y-10">
          <div>
            <h1 className="font-display text-4xl leading-[1.15] tracking-tight xl:text-5xl">
              Your research,
              <br />
              <span className="text-primary-foreground/70 italic">
                intelligently organized.
              </span>
            </h1>
            <p className="text-primary-foreground/60 mt-5 max-w-md text-[15px] leading-relaxed">
              A focused workspace for students and researchers to study smarter
              with AI-powered document analysis.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-4">
                <div className="bg-primary-foreground/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <feature.icon className="text-primary-foreground/80 h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{feature.title}</p>
                  <p className="text-primary-foreground/55 mt-0.5 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-primary-foreground/40 relative text-xs">
          Trusted by researchers and students worldwide
        </p>
      </div>

      {/* Sign-in panel */}
      <div className="relative flex flex-1 flex-col">
        <div className="absolute top-5 right-5 z-10">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="animate-fade-up w-full max-w-[380px] space-y-8">
            <div className="text-center lg:hidden">
              <BrandLogo size="md" showTagline className="justify-center" />
            </div>

            <div className="space-y-2 text-center lg:text-left">
              <h2 className="font-display text-foreground text-2xl tracking-tight">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sign in to access your documents, quizzes, and research chats.
              </p>
            </div>

            <div className="surface-card p-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Sign in with Google to access NoteBot LM"
              >
                {isLoading ? (
                  <>
                    <div className="border-muted-foreground/30 border-t-foreground h-4 w-4 animate-spin rounded-full border-2" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>

            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
