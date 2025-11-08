export interface Textbook {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisherId?: string;
  description?: string;
  coverImage?: string;
  language: string;
  level: string;
  subject: string;
  tags: string[];
  rating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AnalysisResult {
  query: string;
  keywords: string[];
  recommendedBooks: Textbook[];
  explanation: string;
}
