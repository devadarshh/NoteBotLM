"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  CheckCircle2,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";
import { PageShell } from "@/components/layout/page-shell";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  topic: string;
}

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<"generate" | "quiz" | "result">(
    "generate",
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [quizType, setQuizType] = useState<string>("");
  const [numberOfQuestions, setNumberOfQuestions] = useState<string>("");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>(
    [],
  );
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState<number>(0);

  const { data: userDocuments = [], isLoading: isLoadingDocuments } =
    api.chat.listFiles.useQuery();

  const saveQuizAttemptMutation = api.chat.saveQuizAttempt.useMutation();

  const calculateScore = () => {
    let correct = 0;
    generatedQuestions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer !== undefined) {
        if (question.options && question.options.length > 0) {
          if (parseInt(userAnswer) === question.correctAnswer) {
            correct++;
          }
        }
      }
    });
    return correct;
  };

  useEffect(() => {
    const docId = searchParams.get("docId");
    if (docId && userDocuments.length > 0) {
      const documentExists = userDocuments.some((doc) => doc.id === docId);
      if (documentExists) {
        setSelectedDocument(docId);
      }
    }
  }, [searchParams, userDocuments]);

  const generateQuizMutation = api.chat.generateQuiz.useMutation();
  const selectedDoc = userDocuments.find((doc) => doc.id === selectedDocument);

  const handleGenerateQuiz = async () => {
    if (!selectedDocument || !quizType || !numberOfQuestions) return;

    try {
      setIsGeneratingQuiz(true);
      const result = await generateQuizMutation.mutateAsync({
        fileId: selectedDocument,
        quizType: quizType as "MCQ" | "SAQ" | "LAQ",
        numberOfQuestions: parseInt(numberOfQuestions),
      });

      setGeneratedQuestions(result.questions as QuizQuestion[]);
      setCurrentQuestion(0);
      setStage("quiz");
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleNewQuiz = () => {
    setStage("generate");
    setCurrentQuestion(0);
    setGeneratedQuestions([]);
    setSelectedDocument("");
    setQuizType("");
    setNumberOfQuestions("");
    setUserAnswers({});
    setQuizScore(0);
  };

  const currentQ = generatedQuestions[currentQuestion];
  const isMCQ = currentQ?.options && currentQ.options.length > 0;
  const scorePercent = Math.round(
    (quizScore / generatedQuestions.length) * 100,
  );

  return (
    <PageShell narrow>
      {stage === "generate" && (
        <>
          <div className="animate-fade-up mb-10">
            <p className="section-label mb-2">Practice</p>
            <h1 className="font-display text-foreground text-3xl tracking-tight sm:text-4xl">
              Generate Quiz
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Create AI-powered quizzes from your uploaded documents
            </p>
          </div>

          <div className="surface-card animate-fade-up space-y-6 p-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Document</Label>
              <Select
                value={selectedDocument}
                onValueChange={setSelectedDocument}
              >
                <SelectTrigger className="h-10 cursor-pointer">
                  <SelectValue
                    placeholder={
                      isLoadingDocuments
                        ? "Loading documents..."
                        : userDocuments.length === 0
                          ? "No documents uploaded"
                          : "Choose a document"
                    }
                  />
                </SelectTrigger>
                <SelectContent align="start" sideOffset={4}>
                  {isLoadingDocuments ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </div>
                    </SelectItem>
                  ) : userDocuments.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No documents found
                    </SelectItem>
                  ) : (
                    userDocuments.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Quiz type</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger className="h-10 cursor-pointer">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent align="start" sideOffset={4}>
                    <SelectItem value="MCQ">Multiple choice</SelectItem>
                    <SelectItem value="SAQ">Short answer</SelectItem>
                    <SelectItem value="LAQ">Long answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Questions</Label>
                <Select
                  value={numberOfQuestions}
                  onValueChange={setNumberOfQuestions}
                >
                  <SelectTrigger className="h-10 cursor-pointer">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent align="start" sideOffset={4}>
                    <SelectItem value="3">3 questions</SelectItem>
                    <SelectItem value="5">5 questions</SelectItem>
                    <SelectItem value="10">10 questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedDoc && (
              <div className="bg-muted/50 rounded-lg px-4 py-3">
                <p className="text-foreground text-sm font-medium">
                  {selectedDoc.name}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {(selectedDoc.size / 1024 / 1024).toFixed(1)} MB · Uploaded{" "}
                  {new Date(selectedDoc.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerateQuiz}
              className="w-full"
              disabled={
                !selectedDocument ||
                !quizType ||
                !numberOfQuestions ||
                isLoadingDocuments ||
                userDocuments.length === 0 ||
                isGeneratingQuiz
              }
            >
              {isGeneratingQuiz ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate quiz"
              )}
            </Button>

            {userDocuments.length === 0 && !isLoadingDocuments && (
              <div className="text-center">
                <p className="text-muted-foreground mb-3 text-sm">
                  Upload documents first to generate quizzes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/documents")}
                >
                  Go to documents
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      {stage === "quiz" && (
        <>
          <div className="animate-fade-up mb-8 flex items-end justify-between">
            <div>
              <p className="section-label mb-2">{currentQ?.topic}</p>
              <h1 className="font-display text-foreground text-2xl tracking-tight sm:text-3xl">
                Question {currentQuestion + 1}
              </h1>
            </div>
            <span className="text-muted-foreground bg-muted rounded-full px-3 py-1 text-xs tabular-nums">
              {currentQuestion + 1} / {generatedQuestions.length}
            </span>
          </div>

          <div className="surface-card animate-fade-up space-y-6 p-6">
            <p className="text-foreground text-[15px] leading-relaxed font-medium">
              {currentQ?.question}
            </p>

            {isMCQ ? (
              <RadioGroup
                className="space-y-2"
                value={userAnswers[currentQuestion] ?? ""}
                onValueChange={(value) => {
                  setUserAnswers((prev) => ({
                    ...prev,
                    [currentQuestion]: value,
                  }));
                }}
              >
                {currentQ.options?.map((option: string, idx: number) => (
                  <Label
                    key={idx}
                    htmlFor={`option-${idx}`}
                    className={cn(
                      "border-border flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3.5 transition-colors",
                      userAnswers[currentQuestion] === idx.toString()
                        ? "border-accent bg-accent/5"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem
                      value={idx.toString()}
                      id={`option-${idx}`}
                    />
                    <span className="text-foreground flex-1 text-sm">
                      {option}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                placeholder="Type your answer here..."
                rows={6}
                className="resize-none"
              />
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion < generatedQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    const score = calculateScore();
                    setQuizScore(score);

                    if (selectedDocument && quizType) {
                      try {
                        await saveQuizAttemptMutation.mutateAsync({
                          fileId: selectedDocument,
                          quizType: quizType as "MCQ" | "SAQ" | "LAQ",
                          numberOfQuestions: generatedQuestions.length,
                          score,
                          answers: userAnswers,
                          title: selectedDoc?.name
                            ? `Quiz: ${selectedDoc.name}`
                            : "Untitled Quiz",
                        });
                      } catch (error) {
                        console.error("Error saving quiz attempt:", error);
                      }
                    }

                    setStage("result");
                  }}
                  className="flex-1"
                >
                  Submit quiz
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {stage === "result" && (
        <>
          <div className="animate-fade-up mb-10 text-center">
            <p className="section-label mb-2">Results</p>
            <div className="font-display text-accent text-7xl tracking-tight tabular-nums">
              {scorePercent}%
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {quizScore} of {generatedQuestions.length} correct
            </p>
          </div>

          <div className="animate-fade-up mb-8 space-y-3">
            {generatedQuestions.map((q: QuizQuestion, idx: number) => {
              const userAnswer = userAnswers[idx];
              const isCorrect =
                userAnswer !== undefined &&
                (q.options && q.options.length > 0
                  ? parseInt(userAnswer) === q.correctAnswer
                  : false);

              return (
                <div key={idx} className="surface-card p-5">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="text-accent mt-0.5 h-5 w-5 shrink-0" />
                    ) : (
                      <XCircle className="text-destructive mt-0.5 h-5 w-5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground mb-3 text-sm font-medium leading-relaxed">
                        {q.question}
                      </p>
                      {q.options && q.options.length > 0 && (
                        <div className="text-muted-foreground mb-3 space-y-1 text-xs">
                          <p>
                            Your answer:{" "}
                            <span className="text-foreground font-medium">
                              {userAnswer !== undefined
                                ? q.options[parseInt(userAnswer)]
                                : "Not answered"}
                            </span>
                          </p>
                          <p>
                            Correct:{" "}
                            <span className="text-accent font-medium">
                              {typeof q.correctAnswer === "number"
                                ? q.options[q.correctAnswer]
                                : q.correctAnswer}
                            </span>
                          </p>
                        </div>
                      )}
                      <div className="bg-muted/50 rounded-lg px-3 py-2.5">
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleNewQuiz} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              New quiz
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <PageShell narrow>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        </PageShell>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
