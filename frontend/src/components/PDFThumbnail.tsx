"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Book } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// PDF.js worker 설정
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFThumbnailProps {
  pdfUrl: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * PDF의 첫 페이지를 썸네일로 표시하는 컴포넌트
 */
export function PDFThumbnail({
  pdfUrl,
  width = 64,
  height = 80,
  className = ""
}: PDFThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleLoadError = (error: Error) => {
    console.error("PDF 썸네일 로드 실패:", error);
    setIsLoading(false);
    setHasError(true);
  };

  // 로딩 중이거나 에러 시 기본 아이콘 표시
  if (hasError) {
    return (
      <div
        className={`bg-muted rounded flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <Book className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded ${className}`}
      style={{ width, height }}
    >
      {isLoading && (
        <div
          className="absolute inset-0 bg-muted flex items-center justify-center"
          style={{ width, height }}
        >
          <Book className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
      )}

      <Document
        file={pdfUrl}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
        loading={null}
      >
        <Page
          pageNumber={1}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}
