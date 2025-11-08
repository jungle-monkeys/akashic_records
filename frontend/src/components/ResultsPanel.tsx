"use client";

import { BookOpen, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextbookCard } from "@/components/TextbookCard";
import { PDFViewer } from "@/components/PDFViewer";
import { useChatStore } from "@/store/chatStore";

export function ResultsPanel() {
  const { currentAnalysis, selectedBook } = useChatStore();

  // 책이 선택되었고 분석 결과도 있으면 PDF와 검색 결과를 나란히 표시
  if (selectedBook && currentAnalysis) {
    return (
      <div className="flex h-full">
        {/* PDF Viewer - Left Half */}
        <div className="w-3/5 border-r">
          <PDFViewer
            pdfUrl={selectedBook.pdfUrl}
            initialPage={selectedBook.initialPage}
            highlights={selectedBook.highlights}
          />
        </div>



        {/* Search Results - Right Half */}
        <div className="w-2/5 flex flex-col h-full">
          {/* Analysis Header */}
          {/* <div className="p-6 border-b bg-background">
            <div className="flex items-start gap-3">
              <BookOpen className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">분석 결과</h2>
                <p className="text-muted-foreground mb-4">
                  {currentAnalysis.explanation}
                </p>
                {currentAnalysis.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">키워드:</span>
                    {currentAnalysis.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Textbook Results */}
          <ScrollArea className="flex-1 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-1">
                추천 교재 ({currentAnalysis.recommendedBooks.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                입력하신 내용을 바탕으로 관련 교재를 찾았습니다
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {currentAnalysis.recommendedBooks.map((book) => (
                <TextbookCard key={book.id} textbook={book} />
              ))}
            </div>
            {currentAnalysis.recommendedBooks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>관련 교재를 찾을 수 없습니다</p>
                <p className="text-sm mt-2">다른 키워드로 검색해보세요</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  }

  // 책만 선택된 경우 전체 화면으로 PDF 표시
  if (selectedBook) {
    return (
      <PDFViewer
        pdfUrl={selectedBook.pdfUrl}
        initialPage={selectedBook.initialPage}
        highlights={selectedBook.highlights}
      />
    );
  }

  if (!currentAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Search className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">검색 결과가 여기에 표시됩니다</p>
        <p className="text-sm mt-2">
          왼쪽 채팅창에서 관심 주제를 입력해보세요
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Analysis Header */}
      {/* <div className="p-6 border-b bg-background">
        <div className="flex items-start gap-3">
          <BookOpen className="h-6 w-6 text-primary mt-1" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">분석 결과</h2>
            <p className="text-muted-foreground mb-4">
              {currentAnalysis.explanation}
            </p>
            {currentAnalysis.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium">키워드:</span>
                {currentAnalysis.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div> */}

      {/* Textbook Results */}
      <ScrollArea className="flex-1 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">
            추천 교재 ({currentAnalysis.recommendedBooks.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            입력하신 내용을 바탕으로 관련 교재를 찾았습니다
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentAnalysis.recommendedBooks.map((book) => (
            <TextbookCard key={book.id} textbook={book} />
          ))}
        </div>
        {currentAnalysis.recommendedBooks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>관련 교재를 찾을 수 없습니다</p>
            <p className="text-sm mt-2">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
