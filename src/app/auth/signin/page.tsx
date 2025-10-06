"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Background decorations */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute -top-24 -left-24 h-96 w-96 animate-pulse rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-96 w-96 animate-pulse rounded-full bg-purple-400/20 blur-3xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 l -60 0 l 0 -60 z' fill='none' stroke='%23000000' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`,
          }}
        />
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand Section */}
          <div className="animate-fade-in text-center">
            <div className="mb-8 flex items-center justify-center">
              <div className="group relative">
                {/* Logo with enhanced styling */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-500/40">
                  <span className="text-2xl font-bold text-white">S</span>
                </div>
                {/* Floating ring animation */}
                <div className="absolute inset-0 animate-ping rounded-2xl ring-2 ring-blue-400/50" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                ChatDocs
              </h1>
              <p className="text-lg leading-relaxed font-medium text-gray-600">
                AI-Powered Document Intelligence
              </p>
            </div>
          </div>

          {/* Sign in card */}
          <div className="animate-slide-up relative">
            {/* Card glow effect */}
            <div className="animate-tilt absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-20 blur" />

            <div className="relative rounded-2xl border border-white/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-8 text-center">
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900">
                  Welcome back
                </h2>
                <p className="leading-relaxed text-gray-600">
                  Sign in to continue your document analysis journey
                </p>
              </div>

              <div className="space-y-6">
                {/* Enhanced Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-medium text-gray-700 shadow-lg transition-all duration-300 ease-out hover:scale-[1.02] hover:border-gray-300 hover:shadow-xl focus:border-blue-300 focus:ring-4 focus:ring-blue-500/25 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-lg"
                  aria-label="Sign in with Google to access Sage"
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <div className="relative flex items-center justify-center">
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                        <span className="font-medium">Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110"
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
                        <span className="font-medium">
                          Continue with Google
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Additional features section */}
                <div className="border-t border-gray-100 pt-6">
                  <p className="mb-4 text-center text-xs font-medium tracking-wide text-gray-500 uppercase">
                    Why Choose Sage
                  </p>
                  <div className="grid grid-cols-3 gap-6 text-center text-xs text-gray-600">
                    <div className="group flex cursor-default flex-col items-center space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-100 group-hover:shadow-sm">
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium transition-colors duration-200 group-hover:text-blue-600">
                        Secure
                      </span>
                    </div>
                    <div className="group flex cursor-default flex-col items-center space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 transition-all duration-200 group-hover:scale-105 group-hover:bg-green-100 group-hover:shadow-sm">
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium transition-colors duration-200 group-hover:text-green-600">
                        Fast AI
                      </span>
                    </div>
                    <div className="group flex cursor-default flex-col items-center space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 transition-all duration-200 group-hover:scale-105 group-hover:bg-purple-100 group-hover:shadow-sm">
                        <svg
                          className="h-5 w-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <span className="font-medium transition-colors duration-200 group-hover:text-purple-600">
                        Smart
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer text */}
          <div className="animate-fade-in-delayed text-center text-sm text-gray-500">
            <p className="leading-relaxed">
              By signing in, you agree to our{" "}
              <a
                href="#"
                className="rounded-sm font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:outline-none"
                aria-label="View Terms of Service"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="rounded-sm font-medium text-blue-600 transition-all duration-200 hover:text-blue-700 hover:underline focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 focus:outline-none"
                aria-label="View Privacy Policy"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
