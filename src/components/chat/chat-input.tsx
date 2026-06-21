"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, XIcon, FileText } from "lucide-react";
import { api } from "@/trpc/react";
import { fileToBase64 } from "@/lib/utils";
import type { UploadedFile } from "@/components/chat/chat-component";
import { DocumentSelector } from "@/components/chat/document-selector";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  uploadedFiles,
  setUploadedFiles,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadfileMutation = api.chat.uploadFiles.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSubmit(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(selectedFiles);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSelectDocuments = (documents: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      const existingIds = prev.map((file) => file.id);
      const newDocuments = documents.filter(
        (doc) => !existingIds.includes(doc.id),
      );
      return [...prev, ...newDocuments];
    });
  };

  return (
    <div className="border-border bg-background border-t px-4 py-4">
      <div className="mx-auto max-w-3xl">
        {uploadedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="border-border bg-muted/50 relative flex items-center gap-2.5 rounded-lg border py-2 pr-8 pl-2.5"
              >
                <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
                  {file.isUploading ? (
                    <div className="border-primary-foreground/30 border-t-primary-foreground h-3.5 w-3.5 animate-spin rounded-full border-2" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="max-w-[180px] truncate text-xs font-medium">
                    {file.name}
                  </p>
                  <p className="text-muted-foreground text-[10px]">PDF</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5 rounded-md"
                  onClick={() => removeFile(file.id)}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="border-border bg-card focus-within:border-accent/50 focus-within:ring-accent/20 flex items-center gap-1 rounded-xl border p-1.5 shadow-sm focus-within:ring-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 shrink-0 rounded-lg"
              disabled={disabled}
              onClick={handleFileSelect}
              title="Upload new document"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 shrink-0 rounded-lg"
              disabled={disabled}
              onClick={() => setShowDocumentSelector(true)}
              title="Select from uploaded documents"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            <Input
              type="text"
              placeholder="Ask anything about your documents..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="placeholder:text-muted-foreground flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            />

            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              disabled={
                disabled ||
                !input.trim() ||
                uploadedFiles.some((file) => file.isUploading)
              }
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>

        {showDocumentSelector && (
          <DocumentSelector
            onSelectDocuments={handleSelectDocuments}
            onClose={() => setShowDocumentSelector(false)}
            selectedDocumentIds={uploadedFiles.map((file) => file.id)}
          />
        )}
      </div>
    </div>
  );
}
