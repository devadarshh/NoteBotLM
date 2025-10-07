"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  GraduationCap,
  Calendar,
  LogOut,
} from "lucide-react";

const ProgressPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = () => {
    void signOut({ callbackUrl: "/auth/signin" });
  };

  // Get user's first name from session
  const userFirstName = session?.user?.name?.split(" ")[0] ?? "";

  // --- Static mock data ---
  const topics = [
    { topic: "JavaScript", correct_count: 14, total_count: 20 },
    { topic: "React", correct_count: 9, total_count: 10 },
    { topic: "Databases", correct_count: 4, total_count: 10 },
    { topic: "Node.js", correct_count: 6, total_count: 12 },
  ];

  const recentAttempts = [
    {
      id: "1",
      quiz: { title: "JavaScript Fundamentals" },
      score: 8,
      total_questions: 10,
      completed_at: "2025-09-20T10:00:00Z",
    },
    {
      id: "2",
      quiz: { title: "React Hooks Deep Dive" },
      score: 7,
      total_questions: 10,
      completed_at: "2025-09-22T15:30:00Z",
    },
  ];

  const overallStats = {
    totalQuizzes: recentAttempts.length,
    averageScore: 75,
    strongTopics: 2,
    weakTopics: 1,
  };

  // --- Helper functions for icons & colors ---
  const getTopicIcon = (percentage: number) => {
    if (percentage >= 70)
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (percentage < 50)
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-yellow-600" />;
  };

  const getTopicColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-600";
    if (percentage < 50) return "text-red-600";
    return "text-yellow-600";
  };

  const getProgressBarClass = (percentage: number) => {
    if (percentage >= 70) return "bg-green-600";
    if (percentage < 50) return "bg-red-600";
    return "bg-yellow-600";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Clean Header - matching dashboard */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">
                  ChatDocs
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="hidden items-center space-x-2 text-sm text-gray-500 lg:flex">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header - matching dashboard style */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Your Progress, {userFirstName}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track your learning journey and identify areas for improvement
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards - matching dashboard style */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Total Quizzes
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overallStats.totalQuizzes}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Average Score
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {overallStats.averageScore}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Strong Topics
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-green-600">
                    {overallStats.strongTopics}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Needs Work
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-red-600">
                    {overallStats.weakTopics}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic and Recent Quizzes */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Topic Performance */}
          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Topic Performance
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Your strengths and weaknesses by topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {topics.map((topic) => {
                const percentage = Math.round(
                  (topic.correct_count / topic.total_count) * 100,
                );
                return (
                  <div key={topic.topic} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTopicIcon(percentage)}
                        <span className="font-medium text-gray-900">
                          {topic.topic}
                        </span>
                      </div>
                      <span
                        className={`font-semibold ${getTopicColor(percentage)}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarClass(percentage)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {topic.correct_count} correct out of {topic.total_count}{" "}
                      attempts
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Quizzes */}
          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Recent Quizzes
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Your latest quiz attempts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {recentAttempts.map((attempt) => {
                const percentage = Math.round(
                  (attempt.score / attempt.total_questions) * 100,
                );
                return (
                  <div
                    key={attempt.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {attempt.quiz?.title}
                      </span>
                      <span
                        className={`font-semibold ${getTopicColor(percentage)}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {attempt.score}/{attempt.total_questions} correct
                      </span>
                      <span>
                        {new Date(attempt.completed_at).toLocaleDateString(
                          "en-US",
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
