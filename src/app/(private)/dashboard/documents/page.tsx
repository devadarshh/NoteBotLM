"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Eye,
  GraduationCap,
  Calendar,
  LogOut,
} from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();

  // Static mock data for design only
  const documents = [
    {
      id: "1",
      title: "Physics Notes",
      file_size: "1.2 MB",
      upload_date: "2025-10-05",
    },
    {
      id: "2",
      title: "Math Formulas",
      file_size: "2.5 MB",
      upload_date: "2025-10-04",
    },
  ];

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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button and Page Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage your coursebooks
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 border border-gray-100 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload New Document
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload PDF coursebooks (max 50MB)
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Input
                type="file"
                accept="application/pdf"
                className="flex-1 border-gray-200 focus-visible:ring-blue-600"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Documents
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="border border-gray-100 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-semibold text-gray-900">
                        {doc.title}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {doc.file_size} • {doc.upload_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Generate Quiz
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {documents.length === 0 && (
              <Card className="col-span-full border border-gray-100 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No documents yet
                </h3>
                <p className="text-sm text-gray-500">
                  Upload your first coursebook to get started
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
