"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { PageShell } from "@/components/layout/page-shell";
import { Eye, FileText, Trash2, Upload } from "lucide-react";
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

    const uploadPromises = newFiles.map(async (newFile) => {
      try {
        const originalFile = Array.from(selectedFiles).find(
          (f) => f.name === newFile.name,
        );
        if (!originalFile) throw new Error("Original file not found");

        const base64 = await fileToBase64(originalFile);

        await uploadfileMutation.mutateAsync({
          base64Files: [
            {
              name: originalFile.name,
              type: originalFile.type,
              base64,
            },
          ],
        });

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === newFile.id ? { ...f, isUploading: false } : f,
          ),
        );
      } catch (error) {
        console.error("Error uploading file:", newFile.name, error);
        setUploadedFiles((prev) => prev.filter((f) => f.id !== newFile.id));
      }
    });

    await Promise.allSettled(uploadPromises);
    await refetchFiles();
    setUploadedFiles([]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadClick = async () => {
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(selectedFiles);
      setSelectedFiles(null);
      const fileInput = document.querySelector('input[type="file"]');
      //@ts-expect-error - fileInput type needs to be cast to HTMLInputElement
      if (fileInput) fileInput.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync({ fileId });
      void refetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const filesCurrentlyUploading = uploadedFiles.filter((file) => {
    const isInDocuments = documents.some((doc) => doc.name === file.name);
    return file.isUploading && !isInDocuments;
  });

  return (
    <PageShell>
      <div className="animate-fade-up mb-10">
        <p className="section-label mb-2">Library</p>
        <h1 className="font-display text-foreground text-3xl tracking-tight sm:text-4xl">
          Documents
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Upload and manage your course materials
        </p>
      </div>

      {/* Upload */}
      <div className="surface-card animate-fade-up mb-8 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-foreground text-sm font-medium">Upload PDF</h2>
          <span className="text-muted-foreground bg-muted rounded-md px-2 py-0.5 text-xs">
            Max 50 MB
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            type="file"
            accept="application/pdf"
            multiple
            className="border-border bg-background flex-1 cursor-pointer file:mr-3 file:text-sm file:font-medium"
            onChange={handleFileInputChange}
          />
          <Button
            onClick={handleUploadClick}
            disabled={
              !selectedFiles ||
              selectedFiles.length === 0 ||
              uploadfileMutation.isPending
            }
            className="shrink-0"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadfileMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>

        {selectedFiles && selectedFiles.length > 0 && (
          <div className="border-border mt-5 space-y-2 border-t pt-5">
            <p className="section-label mb-3">
              Selected ({selectedFiles.length})
            </p>
            {Array.from(selectedFiles).map((file, index) => (
              <div
                key={index}
                className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
              >
                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {filesCurrentlyUploading.length > 0 && (
        <div className="surface-card border-accent/30 mb-8 p-6">
          <p className="section-label mb-4">Uploading</p>
          <div className="space-y-2">
            {filesCurrentlyUploading.map((file) => (
              <div
                key={file.id}
                className="bg-muted/50 flex items-center gap-3 rounded-lg px-3 py-2.5"
              >
                <div className="border-accent border-t-transparent h-4 w-4 animate-spin rounded-full border-2" />
                <span className="text-sm">{file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document grid */}
      <div>
        <p className="section-label mb-4">Your files</p>

        {isLoadingFiles ? (
          <div className="surface-card flex flex-col items-center justify-center p-16 text-center">
            <div className="border-muted-foreground/30 border-t-foreground mb-4 h-8 w-8 animate-spin rounded-full border-2" />
            <p className="text-muted-foreground text-sm">Loading documents...</p>
          </div>
        ) : documents.length === 0 && uploadedFiles.length === 0 ? (
          <div className="surface-card flex flex-col items-center justify-center p-16 text-center">
            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
              <Upload className="text-muted-foreground h-5 w-5" />
            </div>
            <h3 className="text-foreground text-sm font-medium">
              No documents yet
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Upload your first coursebook to get started
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc.id} className="surface-card group p-4">
                <div className="mb-4 flex items-start gap-3">
                  <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                    <FileText className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-foreground truncate text-sm font-medium">
                      {doc.name}
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                      {(doc.size / 1024 / 1024).toFixed(1)} MB ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 flex-1 text-xs"
                    onClick={() =>
                      router.push(`/dashboard/quiz?docId=${doc.id}`)
                    }
                  >
                    <Eye className="mr-1.5 h-3 w-3" />
                    Quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    onClick={() => handleDeleteFile(doc.id)}
                    disabled={deleteFileMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
