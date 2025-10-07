"use client";

import { type PdfJs, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { searchPlugin } from "@react-pdf-viewer/search";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePdfFullText } from "@/hooks/use-pdf-full-text";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false },
);

interface PdfViewerProps {
  fileUrl?: string;
  textToHighlight: string;
  initialPage?: number;
  fileId?: string;
}

export function PdfViewer({
  fileUrl,
  textToHighlight = "An artificial Intelligence",
  initialPage,
  fileId,
}: PdfViewerProps) {
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [activeTab, setActiveTab] = useState<"fulltext" | "pdf">("fulltext");
  const pdfUrl =
    fileUrl ??
    process.env.NEXT_PUBLIC_SUPABASE_URL +
      "/storage/v1/object/public/files/1758031653771-we8l23-Patent_US8126832.pdf";

  const {
    data: fullTextData,
    loading: fullTextLoading,
    error: fullTextError,
  } = usePdfFullText(fileId ?? null);

  const pdfRef = useRef<PdfJs.PdfDocument>(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const searchPluginInstance = searchPlugin();
  const highlightPluginInstance = highlightPlugin();

  const searchAndHighlight = useCallback(
    async (searchText: string) => {
      if (!searchText || !pdfRef.current) return;

      const doc = pdfRef.current;
      let targetPage;
      // Create regex pattern for multi-line matching
      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const multilineRegex = new RegExp(
        escapedText.replace(/\s+/g, "\\s*[\\r\\n]*\\s*"),
        "gi",
      );
      console.log("multilineRegex", multilineRegex);
      // If we have a specific page, go there directly
      if (initialPage) {
        targetPage = initialPage;
      } else {
        // Otherwise, search through pages to find the text
        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          const page = await doc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");

          if (multilineRegex.test(pageText)) {
            targetPage = pageNum;
            break;
          }
        }
      }
      console.log("targetPage ", targetPage, searchText);
      if (targetPage) {
        pageNavigationPluginInstance.jumpToPage(targetPage - 1);
        void searchPluginInstance.highlight(multilineRegex);
      }
    },
    [initialPage, pageNavigationPluginInstance, searchPluginInstance],
  );

  useEffect(() => {
    if (isLoadingDocument) return;

    void searchAndHighlight(textToHighlight);
  }, [isLoadingDocument, textToHighlight]);

  const renderFormattedText = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Check if this is a page marker
      const pageMarkerMatch = line.match(/^--- Page (\d+) ---$/);
      if (pageMarkerMatch) {
        const pageNum = pageMarkerMatch[1];
        elements.push(
          <div key={`page-${pageNum}-${i}`} className="my-8 flex items-center">
            <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent"></div>
            <div className="bg-primary/10 text-primary mx-4 flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Page {pageNum}</span>
            </div>
            <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent"></div>
          </div>,
        );
        continue;
      }

      // Skip empty lines after page markers
      if (line.trim() === "" && elements.length > 0) {
        continue;
      }

      // Highlight the cited text if it exists in this line
      if (
        textToHighlight &&
        line.toLowerCase().includes(textToHighlight.toLowerCase())
      ) {
        const regex = new RegExp(
          `(${textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
          "gi",
        );
        const parts = line.split(regex);

        elements.push(
          <p key={`line-${i}`} className="text-foreground mb-2 leading-relaxed">
            {parts.map((part, partIndex) => {
              if (part.toLowerCase() === textToHighlight.toLowerCase()) {
                return (
                  <mark
                    key={partIndex}
                    className="bg-primary/20 text-primary animate-pulse rounded px-1 py-0.5"
                  >
                    {part}
                  </mark>
                );
              }
              return part;
            })}
          </p>,
        );
      } else if (line.trim() !== "") {
        elements.push(
          <p key={`line-${i}`} className="text-foreground mb-2 leading-relaxed">
            {line}
          </p>,
        );
      }
    }

    return elements;
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab Navigation */}
      <div className="border-border bg-card flex border-b">
        <Button
          variant={activeTab === "fulltext" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("fulltext")}
          className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
        >
          📄 Full Text
        </Button>
        <Button
          variant={activeTab === "pdf" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("pdf")}
          className="data-[state=active]:border-primary rounded-none border-b-2 border-transparent"
        >
          📋 PDF Viewer
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "fulltext" ? (
          <div className="h-full">
            {fullTextLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                  <p className="text-muted-foreground">
                    Loading document text...
                  </p>
                </div>
              </div>
            ) : fullTextError ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-destructive text-center">
                  <p className="mb-2">Failed to load document text</p>
                  <p className="text-muted-foreground text-sm">
                    {fullTextError}
                  </p>
                </div>
              </div>
            ) : fullTextData ? (
              <ScrollArea className="h-full">
                <div className="mx-auto max-w-4xl p-6">
                  <div className="mb-6">
                    <h2 className="text-foreground mb-2 text-xl font-semibold">
                      {fullTextData.fileName}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {fullTextData.pageCount} pages
                    </p>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    {renderFormattedText(fullTextData.fullText)}
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No document selected</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full">
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
            >
              <div className="h-full">
                <Viewer
                  onDocumentLoad={(e) => {
                    setIsLoadingDocument(false);
                    pdfRef.current = e.doc;
                  }}
                  fileUrl={pdfUrl}
                  plugins={[
                    defaultLayoutPluginInstance,
                    pageNavigationPluginInstance,
                    searchPluginInstance,
                    highlightPluginInstance,
                  ]}
                />
              </div>
            </Worker>
          </div>
        )}
      </div>
    </div>
  );
}
