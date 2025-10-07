"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

const ProgressPage = () => {
  const router = useRouter();

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
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage < 50)
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getTopicColor = (percentage: number) => {
    if (percentage >= 70) return "text-green-500";
    if (percentage < 50) return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="from-background via-secondary/20 to-primary/5 min-h-screen bg-gradient-to-br">
      {/* Navbar */}
      <nav className="border-border/50 bg-card/50 border-b backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground">
            Track your learning journey and identify areas for improvement
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {overallStats.totalQuizzes}
              </span>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">
                {overallStats.averageScore}%
              </span>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Strong Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-green-500">
                {overallStats.strongTopics}
              </span>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                Needs Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-red-500">
                {overallStats.weakTopics}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Topic and Recent Quizzes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Topic Performance */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
              <CardDescription>
                Your strengths and weaknesses by topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => {
                const percentage = Math.round(
                  (topic.correct_count / topic.total_count) * 100,
                );
                return (
                  <div key={topic.topic} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTopicIcon(percentage)}
                        <span className="font-medium">{topic.topic}</span>
                      </div>
                      <span
                        className={`font-bold ${getTopicColor(percentage)}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <ProgressBar value={percentage} className="h-2" />
                    <p className="text-muted-foreground text-xs">
                      {topic.correct_count} correct out of {topic.total_count}{" "}
                      attempts
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Quizzes */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
              <CardDescription>Your latest quiz attempts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAttempts.map((attempt) => {
                const percentage = Math.round(
                  (attempt.score / attempt.total_questions) * 100,
                );
                return (
                  <div key={attempt.id} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {attempt.quiz?.title}
                      </span>
                      <span
                        className={`font-bold ${getTopicColor(percentage)}`}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>
                        {attempt.score}/{attempt.total_questions} correct
                      </span>
                      <span>
                        {new Date(attempt.completed_at).toLocaleDateString(
                          "en-IN",
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
