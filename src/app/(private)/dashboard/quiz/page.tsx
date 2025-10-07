"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";

export default function QuizPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"generate" | "quiz" | "result">(
    "generate",
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const mockQuestions = [
    {
      question: "What is the unit of acceleration?",
      options: ["m/s", "m/s²", "km/h", "m²/s"],
      correctAnswer: 1 as number,
      explanation:
        "Acceleration is the rate of change of velocity per unit time.",
      topic: "Physics",
    },
    {
      question: "Define displacement.",
      options: [],
      correctAnswer: 0,
      explanation:
        "Displacement is the shortest distance between initial and final positions.",
      topic: "Physics",
    },
  ];

  const currentQ = mockQuestions[currentQuestion];
  const isMCQ = currentQ?.options && currentQ.options.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Clean Header - Matching Dashboard */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* -------------------- Generate Quiz Section -------------------- */}
        {stage === "generate" && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Generate Quiz
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Create AI-powered quizzes from your coursebooks
              </p>
            </div>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Select Document
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Choose a document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Physics Notes</SelectItem>
                      <SelectItem value="2">Math Formulas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Quiz Type
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice</SelectItem>
                      <SelectItem value="SAQ">Short Answer</SelectItem>
                      <SelectItem value="LAQ">Long Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Number of Questions
                  </Label>
                  <Select>
                    <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => setStage("quiz")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generate Quiz
                </Button>

                <p className="text-center text-sm text-gray-400">
                  Please upload documents first to generate quizzes
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* -------------------- Quiz Questions Section -------------------- */}
        {stage === "quiz" && (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Question {currentQuestion + 1} of {mockQuestions.length}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{currentQ?.topic}</p>
              </div>
              <div className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
                <span className="text-sm font-semibold text-gray-900">
                  {currentQuestion + 1}/{mockQuestions.length}
                </span>
              </div>
            </div>

            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <p className="text-lg font-medium text-gray-900">
                  {currentQ?.question}
                </p>

                {isMCQ ? (
                  <RadioGroup className="space-y-3">
                    {currentQ.options.map((option, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50"
                      >
                        <RadioGroupItem
                          value={idx.toString()}
                          id={`option-${idx}`}
                          className="border-gray-300"
                        />
                        <Label
                          htmlFor={`option-${idx}`}
                          className="flex-1 cursor-pointer text-gray-700"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <Textarea
                    placeholder="Type your answer here..."
                    rows={6}
                    className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentQuestion(Math.max(0, currentQuestion - 1))
                    }
                    disabled={currentQuestion === 0}
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  {currentQuestion < mockQuestions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setStage("result")}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* -------------------- Quiz Results Section -------------------- */}
        {stage === "result" && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Quiz Results
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here&apos;s how you performed
              </p>
            </div>

            {/* Score Card */}
            <Card className="border border-gray-100 bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="mb-2 text-6xl font-bold text-blue-600">
                    80%
                  </div>
                  <p className="text-gray-500">4 out of 5 correct</p>
                </div>
              </CardContent>
            </Card>

            {/* Question Review */}
            <div className="space-y-4">
              {mockQuestions.map((q, idx) => (
                <Card
                  key={idx}
                  className="border border-gray-100 bg-white shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {idx % 2 === 0 ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="mb-3 font-semibold text-gray-900">
                          {q.question}
                        </p>
                        {q.options.length > 0 && (
                          <>
                            <p className="mb-1 text-sm text-gray-500">
                              Your answer:{" "}
                              <span className="font-medium">
                                {q.options[0]}
                              </span>
                            </p>
                            <p className="mb-3 text-sm text-green-600">
                              Correct answer:{" "}
                              <span className="font-medium">
                                {q.options[q.correctAnswer]}
                              </span>
                            </p>
                          </>
                        )}
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-blue-600">
                              Explanation:{" "}
                            </span>
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setStage("generate")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                New Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
