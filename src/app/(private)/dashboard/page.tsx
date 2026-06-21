"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  ArrowRight,
  BookOpen,
  Bot,
  FileText,
  Flame,
  LogOut,
  TrendingUp,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    title: "Upload documents",
    description: "Add PDFs and course materials to your library",
    href: "/dashboard/documents",
    icon: Upload,
  },
  {
    title: "Take a quiz",
    description: "Test your knowledge with AI-generated questions",
    href: "/dashboard/quiz",
    icon: FileText,
  },
  {
    title: "View analytics",
    description: "Track progress and identify weak areas",
    href: "/dashboard/analytics",
    icon: TrendingUp,
  },
  {
    title: "AI tutor",
    description: "Chat with your documents for instant answers",
    href: "/chat",
    icon: Bot,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: dashboardStats, isLoading: isLoadingStats } =
    api.chat.getDashboardStats.useQuery();

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/auth/signin" });
  };

  const userFirstName = session?.user?.name?.split(" ")[0] ?? "there";

  const stats = [
    {
      label: "Documents",
      value: dashboardStats?.totalDocuments ?? 0,
      hint:
        dashboardStats?.totalDocuments && dashboardStats.totalDocuments > 0
          ? "In your library"
          : "Upload your first PDF",
      icon: BookOpen,
    },
    {
      label: "Quizzes done",
      value: dashboardStats?.quizzesCompleted ?? 0,
      hint: dashboardStats?.averageScore
        ? `${dashboardStats.averageScore}% average`
        : "Start practicing",
      icon: FileText,
    },
    {
      label: "Avg. score",
      value: dashboardStats?.averageScore ? `${dashboardStats.averageScore}%` : "—",
      hint: "Across all attempts",
      icon: TrendingUp,
    },
    {
      label: "Study time",
      value: dashboardStats?.studyTimeHours
        ? `${dashboardStats.studyTimeHours}h`
        : "0h",
      hint: "This week",
      icon: BookOpen,
    },
  ];

  return (
    <div className="page-grid-bg bg-background min-h-screen">
      <header className="glass-header sticky top-0 z-50 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size="sm" />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5 px-2.5 text-xs"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="animate-fade-up mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label mb-3">Dashboard</p>
            <h1 className="font-display text-foreground text-4xl tracking-tight sm:text-5xl">
              Good to see you, {userFirstName}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg text-[15px] leading-relaxed">
              Your learning workspace — upload materials, practice with quizzes,
              and research with AI.
            </p>
          </div>

          <div className="surface-card flex items-center gap-4 px-5 py-4">
            <div className="bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Flame className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="section-label">Streak</p>
              <p className="stat-value text-2xl">
                {isLoadingStats ? (
                  <span className="bg-muted inline-block h-7 w-12 animate-pulse rounded" />
                ) : (
                  `${dashboardStats?.streak ?? 0} days`
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "bg-card animate-fade-up p-5 sm:p-6",
                i > 0 && "border-border border-l",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="section-label">{stat.label}</p>
                <stat.icon className="text-muted-foreground/60 h-4 w-4" />
              </div>
              <p className="stat-value">
                {isLoadingStats ? (
                  <span className="bg-muted inline-block h-8 w-14 animate-pulse rounded" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-muted-foreground mt-1.5 text-xs">{stat.hint}</p>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section>
          <div className="mb-6">
            <p className="section-label mb-2">Quick actions</p>
            <h2 className="font-display text-foreground text-2xl tracking-tight">
              What would you like to do?
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action, i) => (
              <button
                key={action.title}
                onClick={() => router.push(action.href)}
                className="surface-card group animate-fade-up flex cursor-pointer items-start gap-4 p-5 text-left transition-colors hover:bg-muted/40"
                style={{ animationDelay: `${(i + 4) * 60}ms` }}
              >
                <div className="bg-muted group-hover:bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                  <action.icon className="text-muted-foreground group-hover:text-accent h-[18px] w-[18px] transition-colors" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-foreground text-sm font-medium">
                      {action.title}
                    </h3>
                    <ArrowRight className="text-muted-foreground/0 group-hover:text-muted-foreground h-4 w-4 shrink-0 transition-all group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
