"use client";

import { Book, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textbook } from "@/types/Textbook";
import { cn } from "@/lib/utils";

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center shrink-0">
            {textbook.coverImage ? (
              <img
                src={textbook.coverImage}
                alt={textbook.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Book className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
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
