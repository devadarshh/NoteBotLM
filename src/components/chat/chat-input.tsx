"use client";

import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, XIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { fileToBase64 } from "@/lib/utils";
import type { UploadedFile } from "@/components/chat/chat-component";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: Dispatch<SetStateAction<UploadedFile[]>>;
}

export function ChatInput({ onSubmit, disabled = false, uploadedFiles, setUploadedFiles }: ChatInputProps) {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadfileMutation = api.chat.uploadFiles.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSubmit(input.trim());
    setInput("");
    // Don't clear files - they persist throughout the conversation
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
          setUploadedFiles((prev) => prev.filter((f) => f.id !== newFiles[index]?.id));
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
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };
  return (
    <div className="bg-background p-4">
      <div className="mx-auto max-w-4xl">
        {uploadedFiles.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="relative flex items-center space-x-3 rounded-2xl border border-gray-200 bg-white p-3 pr-8 shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                  {file.isUploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg
                      className="h-5 w-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="max-w-[200px] truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">PDF</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full border border-gray-200 bg-white hover:bg-gray-100"
                  onClick={() => removeFile(file.id)}
                >
                  <XIcon className="h-3 w-3 text-gray-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-muted/50 flex items-center space-x-2 rounded-full border p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 cursor-pointer rounded-full"
              disabled={disabled}
              onClick={handleFileSelect}
            >
              <Plus className="h-4 w-4" />
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
              placeholder="Ask anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="placeholder:text-muted-foreground/70 flex-1 border-0 bg-transparent px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            <div className="flex flex-shrink-0 items-center space-x-1">
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer rounded-full"
                disabled={
                  disabled ||
                  !input.trim() ||
                  uploadedFiles.some((file) => file.isUploading)
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}