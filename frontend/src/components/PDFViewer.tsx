"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chatStore";

export function PDFViewer() {
  const { selectedBook, setSelectedBook } = useChatStore();

  function handleClose() {
    setSelectedBook(null);
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

      {/* PDF Content - 브라우저 기본 뷰어 사용 */}
      <div className="flex-1 w-full">
        <iframe
          src="/testpdf.pdf"
          className="w-full h-full border-0"
          title={selectedBook.title}
        />
      </div>
    </div>
  );
}
