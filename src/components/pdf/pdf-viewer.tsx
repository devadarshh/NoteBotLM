"use client";

import { type PdfJs, Worker } from '@react-pdf-viewer/core';
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { searchPlugin } from "@react-pdf-viewer/search";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from "next/dynamic";

const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);

interface PdfViewerProps {
  fileUrl?: string;
  textToHighlight: string
  initialPage?: number
}

export function PdfViewer({ fileUrl,textToHighlight = "An artificial Intelligence",initialPage }: PdfViewerProps) {
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const pdfUrl = fileUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL+"/storage/v1/object/public/files/1758031653771-we8l23-Patent_US8126832.pdf";

  const pdfRef = useRef<PdfJs.PdfDocument>(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const searchPluginInstance = searchPlugin();
  const highlightPluginInstance = highlightPlugin();

  const searchAndHighlight = useCallback(
    async (searchText: string) => {
      if (!searchText || !pdfRef.current) return;

      const doc = pdfRef.current;
      let targetPage
       // Create regex pattern for multi-line matching
       const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const multilineRegex = new RegExp(escapedText.replace(/\s+/g, '\\s*[\\r\\n]*\\s*'), 'gi');
      console.log('multilineRegex',multilineRegex)
      // If we have a specific page, go there directly
      if (initialPage) {
        targetPage = initialPage
      }else{
        // Otherwise, search through pages to find the text
        for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
          const page = await doc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
  
          if (multilineRegex.test(pageText)) {
            targetPage = pageNum
            break;
          }
        }
      }
      console.log('targetPage ',targetPage, searchText)
      if(targetPage){
        pageNavigationPluginInstance.jumpToPage(targetPage - 1);
        void searchPluginInstance.highlight(multilineRegex);
      }
    },
    [initialPage, pageNavigationPluginInstance, searchPluginInstance]
  );

  useEffect(()=>{
    if(isLoadingDocument)
      return;

    void searchAndHighlight(textToHighlight);
  },[isLoadingDocument,textToHighlight])

  return (
    <div className="h-full w-full">
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
        <div className="h-full">
          <Viewer onDocumentLoad={(e) => {
            setIsLoadingDocument(false);
            pdfRef.current = e.doc;
          }} fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance,pageNavigationPluginInstance,searchPluginInstance,highlightPluginInstance]}/>
        </div>
      </Worker>
    </div>
  );
}