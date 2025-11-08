"use client";

import { Book, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textbook } from "@/types/Textbook";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { PDFThumbnail } from "./PDFThumbnail";

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  const { selectedBook, setSelectedBook } = useChatStore();

  const handleClick = () => {
    setSelectedBook(textbook);
  };

  const isSelected = selectedBook?.id === textbook.id;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all cursor-pointer",
        isSelected && "ring-2 ring-primary shadow-lg bg-primary/5"
      )}
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* PDF 첫 페이지를 썸네일로 표시 */}
          <PDFThumbnail
            pdfUrl={textbook.pdfUrl}
            width={64}
            height={80}
            className="shrink-0"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2">{textbook.title}</CardTitle>
            <CardDescription className="mt-1">{textbook.author}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {textbook.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {textbook.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className={cn(
              "px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"
            )}>
              {textbook.subject}
            </span>
            <span>{textbook.level}</span>
            <span>{textbook.language}</span>
          </div>

          {textbook.tags && textbook.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {textbook.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {textbook.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{textbook.rating.toFixed(1)}</span>
              {textbook.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({textbook.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
