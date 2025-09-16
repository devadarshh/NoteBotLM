"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, XIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { fileToBase64 } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string,fileIds?: string[]) => void;
  disabled?: boolean;
}

interface UploadFile {
  id: string;
  name: string;
  type: string;
  isUploading: boolean;
}


export function ChatInput({ onSubmit, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadfileMutation = api.chat.uploadFiles.useMutation();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSubmit(input.trim(),files.map((file) => file.id));
    setInput("");
    setFiles([]);
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

    setFiles((prev) => [...prev, ...newFiles]);

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
            setFiles((prev) =>
              prev.map((f) => {
                if (f.id === newFiles[index]?.id) {
                  return { ...f, id: uploadedFile.id, isUploading: false };
                }
                return f;
              }),
            );
          } else {
            setFiles((prev) =>
              prev.filter((f) => f.id !== newFiles[index]?.id),
            );
          }
        } catch (error) {
          console.error("Error uploading file", error);
          setFiles((prev) => prev.filter((f) => f.id !== newFiles[index]?.id));
        }
      },
    );

    await Promise.allSettled(uploadPromises);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(selectedFiles);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };
  return (
    <div className="p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        {files.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center space-x-3 bg-white rounded-2xl border border-gray-200 p-3 pr-8 relative shadow-sm"
              >
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {file.isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5 text-white"
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">PDF</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full hover:bg-gray-100 bg-white border border-gray-200"
                  onClick={() => removeFile(file.id)}
                >
                  <XIcon className="h-3 w-3 text-gray-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center space-x-2 bg-muted/50 rounded-full border p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
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
              className="flex-1 border-0 bg-transparent placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
            />

            <div className="flex items-center space-x-1 flex-shrink-0">
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={disabled || !input.trim() || files.some((file) => file.isUploading)}
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