"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";
import { Highlight, PDFViewerProps } from "@/types/PDF";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewer({ pdfUrl, initialPage = 1, highlights: initialHighlights = [] }: PDFViewerProps) {
  const { selectedBook, setSelectedBook } = useChatStore();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);
  const [scale, setScale] = useState(1.0);
  const pageRef = useRef<HTMLDivElement>(null);

  // props가 변경될 때 state 업데이트
  useEffect(() => {
    setPageNumber(initialPage);
    setHighlights(initialHighlights);
  }, [initialPage, initialHighlights]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function handleClose() {
    setSelectedBook(null);
  }

  function goToPrevPage() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }

  function goToNextPage() {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  }

  function zoomIn() {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }

  function zoomOut() {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }

  if (!selectedBook) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{selectedBook.title}</h2>
          <p className="text-sm text-muted-foreground truncate">
            {selectedBook.author}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="ml-4"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-b bg-background gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm whitespace-nowrap">
            Page {pageNumber} of {numPages || "..."}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm whitespace-nowrap">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-4">
        <div ref={pageRef} className="relative">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8">
                <p className="text-destructive">Failed to load PDF file.</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Loading page...</p>
                </div>
              }
              className="shadow-lg"
            />
          </Document>

          {/* 하이라이트 오버레이 */}
          {highlights
            .filter((highlight) => highlight.page === pageNumber)
            .map((highlight, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${highlight.x * scale}px`,
                  top: `${highlight.y * scale}px`,
                  width: `${highlight.width * scale}px`,
                  height: `${highlight.height * scale}px`,
                  backgroundColor: highlight.color || "rgba(255, 255, 0, 0.4)",
                  pointerEvents: "none", // 클릭 방지
                  zIndex: 10,
                }}
              />
            ))}

          {/* 워터마크 오버레이 */}
          <div
            style={{
              position: "absolute",
              top: `${10 * scale}px`,
              right: `${10 * scale}px`,
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <div
              style={{
                fontSize: `${Math.max(10, 12 * scale)}px`,
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.3)",
                userSelect: "none",
                whiteSpace: "nowrap",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                padding: `${4 * scale}px ${8 * scale}px`,
                borderRadius: `${4 * scale}px`,
              }}
            >
              Girae Kim (4645762)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
