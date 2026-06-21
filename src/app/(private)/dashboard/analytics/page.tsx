"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

const ProgressPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userFirstName = session?.user?.name?.split(" ")[0] ?? "";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: recentQuizzes = [], isLoading: isLoadingQuizzes } =
    api.chat.getRecentQuizzes.useQuery({ limit: 5 });

  const calculateStats = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (recentQuizzes.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        strongTopics: 0,
        weakTopics: 0,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const totalScore = recentQuizzes.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      (sum, quiz) => sum + Math.round((quiz.score / quiz.totalQuestions) * 100),
      0,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const averageScore = Math.round(totalScore / recentQuizzes.length);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const strongTopics = recentQuizzes.filter(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (quiz) => (quiz.score / quiz.totalQuestions) * 100 >= 70,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ).length;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const weakTopics = recentQuizzes.filter(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (quiz) => (quiz.score / quiz.totalQuestions) * 100 < 50,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ).length;

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      totalQuizzes: recentQuizzes.length,
      averageScore,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      strongTopics,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      weakTopics,
    };
  };

  const overallStats = calculateStats();

  const calculateTopicPerformance = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (recentQuizzes.length === 0) return [];

    const topicMap = new Map<string, { correct: number; total: number }>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    recentQuizzes.forEach((quiz) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const topicName = quiz.file.name.replace(/\.(pdf|txt|docx?)$/i, "");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const existing = topicMap.get(topicName) ?? { correct: 0, total: 0 };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      topicMap.set(topicName, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        correct: existing.correct + quiz.score,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        total: existing.total + quiz.totalQuestions,
      });
    });

    return Array.from(topicMap.entries()).map(([topic, data]) => ({
      topic,
      correct_count: data.correct,
      total_count: data.total,
    }));
  };

  const topics = calculateTopicPerformance();

  const getTopicIcon = (percentage: number) => {
    if (percentage >= 70)
      return <TrendingUp className="text-accent h-4 w-4" />;
    if (percentage < 50)
      return <TrendingDown className="text-destructive h-4 w-4" />;
    return <Minus className="text-muted-foreground h-4 w-4" />;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-accent";
    if (percentage < 50) return "text-destructive";
    return "text-muted-foreground";
  };

  const getProgressBarClass = (percentage: number) => {
    if (percentage >= 70) return "bg-accent";
    if (percentage < 50) return "bg-destructive";
    return "bg-muted-foreground/50";
  };

  const statCards = [
    { label: "Total quizzes", value: overallStats.totalQuizzes },
    { label: "Average score", value: `${overallStats.averageScore}%` },
    { label: "Strong topics", value: overallStats.strongTopics },
    { label: "Needs work", value: overallStats.weakTopics },
  ];

  return (
    <PageShell>
      <div className="animate-fade-up mb-10">
        <p className="section-label mb-2">Insights</p>
        <h1 className="font-display text-foreground text-3xl tracking-tight sm:text-4xl">
          {userFirstName ? `${userFirstName}'s progress` : "Your progress"}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Track performance and identify areas to improve
        </p>
      </div>

      <section className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className={cn("bg-card p-5 sm:p-6", i > 0 && "border-border border-l")}
          >
            <p className="section-label mb-3">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Topic performance */}
        <div className="surface-card">
          <div className="border-border border-b px-6 py-5">
            <h2 className="text-foreground text-sm font-medium">
              Topic performance
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Strengths and weaknesses by document
            </p>
          </div>
          <div className="space-y-5 p-6">
            {topics.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Complete quizzes to see topic breakdowns.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/quiz")}
                  className="mt-4"
                  size="sm"
                >
                  Take a quiz
                </Button>
              </div>
            ) : (
              topics.map((topic) => {
                const percentage = Math.round(
                  (topic.correct_count / topic.total_count) * 100,
                );
                return (
                  <div key={topic.topic} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        {getTopicIcon(percentage)}
                        <span className="text-foreground truncate text-sm font-medium">
                          {topic.topic}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          getScoreColor(percentage),
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          getProgressBarClass(percentage),
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {topic.correct_count} of {topic.total_count} correct
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent quizzes */}
        <div className="surface-card">
          <div className="border-border border-b px-6 py-5">
            <h2 className="text-foreground text-sm font-medium">
              Recent quizzes
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Your latest attempts
            </p>
          </div>
          <div className="space-y-2 p-4">
            {isLoadingQuizzes ? (
              <p className="text-muted-foreground py-6 text-center text-sm">
                Loading...
              </p>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            ) : recentQuizzes.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-muted-foreground text-sm">
                  No quiz attempts yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/quiz")}
                  className="mt-4"
                  size="sm"
                >
                  Generate quiz
                </Button>
              </div>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
              recentQuizzes.map((attempt) => {
                const percentage = Math.round(
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  (attempt.score / attempt.totalQuestions) * 100,
                );
                return (
                  <div
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    key={attempt.id}
                    className="bg-muted/40 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-medium">
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                          {attempt.quiz.title}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                          {attempt.file.name}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-sm font-semibold tabular-nums",
                          getScoreColor(percentage),
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-muted-foreground mt-2 flex justify-between text-xs">
                      <span>
                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                        {attempt.score}/{attempt.totalQuestions} correct
                      </span>
                      <span>
                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access */}
                        {new Date(attempt.completedAt).toLocaleDateString(
                          "en-US",
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ProgressPage;
