"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  FileText,
  TrendingUp,
  Upload,
  LogOut,
  GraduationCap,
  Clock,
  Calendar,
  Award,
  Bot,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  const handleQuizClick = () => {
    router.push("/dashboard/quiz");
  };
  const handleDocumentClick = () => {
    router.push("/dashboard/documents");
  };
  const handleAITutorClick = () => {
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Clean Header */}
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
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Minimal Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back, Adarsh
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Here&apos;s your learning overview
              </p>
            </div>
            <div className="hidden items-center space-x-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 sm:flex">
              <Award className="h-4 w-4 text-blue-600" />
              <div className="text-right">
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-sm font-semibold text-gray-900">5 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Total Documents
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    12
                  </p>
                  <p className="mt-1 text-xs text-gray-400">+2 this week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Quizzes Completed
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">8</p>
                  <p className="mt-1 text-xs text-gray-400">87% avg score</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
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
                    85%
                  </p>
                  <p className="mt-1 text-xs text-gray-400">+5% improvement</p>
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
                    Study Time
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    24h
                  </p>
                  <p className="mt-1 text-xs text-gray-400">This week</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Minimal Quick Actions */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card
              className="group cursor-pointer border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              onClick={handleDocumentClick}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Upload Documents
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Add study materials
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              onClick={handleQuizClick}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Take Quiz</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Test your knowledge
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      View Analytics
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">Track progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="group cursor-pointer border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md"
              onClick={handleAITutorClick}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-start space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Tutor</h4>
                    <p className="mt-1 text-sm text-gray-500">Get help</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
