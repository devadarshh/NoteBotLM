"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, Mic, Pause } from "lucide-react";
import { api } from "@/trpc/react";
import { fileToBase64 } from "@/lib/utils";

interface ChatInputProps {
  onSubmit: (message: string) => void;
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
  return (
    <div className="p-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center space-x-2 bg-muted/50 rounded-full border p-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full flex-shrink-0"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>

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
                disabled={disabled || !input.trim()}
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