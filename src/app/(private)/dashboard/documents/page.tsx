"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
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
import { fileToBase64 } from "@/lib/utils";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  isUploading: boolean;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  // Fetch user's actual uploaded files from database
  const {
    data: documents = [],
    refetch: refetchFiles,
    isLoading: isLoadingFiles,
  } = api.chat.listFiles.useQuery();
  const uploadfileMutation = api.chat.uploadFiles.useMutation();
  const deleteFileMutation = api.chat.deleteFile.useMutation();
  const handleFileUpload = async (selectedFiles: FileList) => {
    const newFiles = Array.from(selectedFiles).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      isUploading: true,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    const uploadPromises = Array.from(selectedFiles).map(
      async (file, index) => {
        try {
          const base64 = await fileToBase64(file);

          const {
            files: [uploadedFile],
          } = await uploadfileMutation.mutateAsync({
            base64Files: [
              {
                name: file.name,
                type: file.type,
                base64,
              },
            ],
          });

          if (uploadedFile?.id) {
            setUploadedFiles((prev) =>
              prev.map((f) => {
                if (f.id === newFiles[index]?.id) {
                  return { ...f, id: uploadedFile.id, isUploading: false };
                }
                return f;
              }),
            );
            // Refresh the documents list to show newly uploaded files
            void refetchFiles();
          } else {
            setUploadedFiles((prev) =>
              prev.filter((f) => f.id !== newFiles[index]?.id),
            );
          }
        } catch (error) {
          console.error("Error uploading file", error);
          setUploadedFiles((prev) =>
            prev.filter((f) => f.id !== newFiles[index]?.id),
          );
        }
      },
    );

    await Promise.allSettled(uploadPromises);

    // Clear uploaded files list after all uploads are complete
    setTimeout(() => {
      setUploadedFiles([]);
    }, 2000);
  };
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    setSelectedFiles(files);
  };

  const handleUploadClick = async () => {
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(selectedFiles);
      setSelectedFiles(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      //@ts-expect-error - fileInput type needs to be cast to HTMLInputElement
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync({ fileId });
      void refetchFiles(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
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
                multiple
                className="flex-1 border-gray-200 focus-visible:ring-blue-600"
                onChange={handleFileInputChange}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleUploadClick}
                disabled={
                  !selectedFiles ||
                  selectedFiles.length === 0 ||
                  uploadfileMutation.isPending
                }
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadfileMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Show files currently being uploaded */}
        {uploadedFiles.length > 0 && (
          <Card className="mb-8 border border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-amber-800">
                Uploading Files
              </h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg bg-white p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      {file.isUploading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                      ) : (
                        <FileText className="h-5 w-5 text-amber-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-900">{file.name}</p>
                      <p className="text-sm text-amber-700">
                        {file.isUploading ? "Uploading..." : "Upload complete"}
                      </p>
                    </div>
                    {!file.isUploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                        {doc.name}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB •{" "}
                        {new Date(doc.createdAt).toLocaleDateString()}
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
                      onClick={() => handleDeleteFile(doc.id)}
                      disabled={deleteFileMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State or Loading */}
            {isLoadingFiles ? (
              <Card className="col-span-full border border-gray-100 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Loading documents...
                </h3>
                <p className="text-sm text-gray-500">
                  Please wait while we fetch your files
                </p>
              </Card>
            ) : documents.length === 0 && uploadedFiles.length === 0 ? (
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
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
