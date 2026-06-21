"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/trpc/react";
import { FileText, Check, X, Loader2 } from "lucide-react";
import type { UploadedFile } from "@/components/chat/chat-component";
import { cn } from "@/lib/utils";

interface DocumentSelectorProps {
  onSelectDocuments: (documents: UploadedFile[]) => void;
  onClose: () => void;
  selectedDocumentIds: string[];
}

export function DocumentSelector({
  onSelectDocuments,
  onClose,
  selectedDocumentIds,
}: DocumentSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedDocumentIds);

  const { data: files, isLoading } = api.chat.listFiles.useQuery();

  const handleToggleDocument = (fileId: string) => {
    setSelectedIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const handleConfirmSelection = () => {
    if (!files) return;

    const selectedDocuments: UploadedFile[] = files
      .filter((file) => selectedIds.includes(file.id))
      .map((file) => ({
        id: file.id,
        name: file.name,
        type: file.fileType,
        isUploading: false,
      }));

    onSelectDocuments(selectedDocuments);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="surface-card flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-foreground text-sm font-medium">
            Select documents
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
            </div>
          ) : !files || files.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                No documents found. Upload some first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const isSelected = selectedIds.includes(file.id);
                return (
                  <button
                    key={file.id}
                    type="button"
                    className={cn(
                      "border-border flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                      isSelected
                        ? "border-accent bg-accent/5"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => handleToggleDocument(file.id)}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isSelected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {formatFileSize(file.size)} · {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="border-border flex items-center justify-between border-t px-5 py-4">
          <p className="text-muted-foreground text-xs">
            {selectedIds.length} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSelection}
              disabled={selectedIds.length === 0}
            >
              Add documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
