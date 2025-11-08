import { AnalysisResult } from "@/types/Textbook";
import { searchTextbooks } from "./mockData";

// Simulated LLM service
// In production, this would call an actual LLM API (OpenAI, Claude, etc.)
export async function analyzeLearningQuery(
  query: string
): Promise<AnalysisResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple keyword extraction (in production, use actual LLM)
  const keywords = extractKeywords(query);

  // Search for relevant textbooks
  const recommendedBooks = searchTextbooks(keywords);

  // Generate explanation
  const explanation = generateExplanation(query, keywords, recommendedBooks.length);

  return {
    query,
    keywords,
    recommendedBooks,
    explanation,
  };
}

function extractKeywords(query: string): string[] {
  const lowerQuery = query.toLowerCase();

  // Common learning-related keywords mapping
  const keywordMap: Record<string, string[]> = {
    "웹": ["web", "frontend", "backend", "javascript", "react"],
    "web": ["web", "frontend", "javascript", "react"],
    "프론트엔드": ["frontend", "react", "javascript", "web"],
    "frontend": ["frontend", "react", "javascript", "web"],
    "백엔드": ["backend", "node.js", "api", "server"],
    "backend": ["backend", "node.js", "api", "server"],
    "머신러닝": ["machine learning", "ml", "ai", "python"],
    "machine learning": ["machine learning", "ml", "ai", "python"],
    "ai": ["ai", "machine learning", "deep learning"],
    "인공지능": ["ai", "machine learning", "deep learning"],
    "파이썬": ["python", "programming"],
    "python": ["python", "programming"],
    "자바스크립트": ["javascript", "web", "programming"],
    "javascript": ["javascript", "web", "programming"],
    "리액트": ["react", "frontend", "web"],
    "react": ["react", "frontend", "web"],
    "알고리즘": ["algorithms", "data structures", "computer science"],
    "algorithm": ["algorithms", "data structures", "computer science"],
    "데이터": ["data", "data science", "machine learning"],
    "data": ["data", "data science", "machine learning"],
  };

  const keywords = new Set<string>();

  // Extract keywords based on query
  Object.entries(keywordMap).forEach(([trigger, relatedKeywords]) => {
    if (lowerQuery.includes(trigger)) {
      relatedKeywords.forEach((kw) => keywords.add(kw));
    }
  });

  // If no specific keywords found, extract common tech terms
  if (keywords.size === 0) {
    const techTerms = [
      "react", "javascript", "python", "web", "api",
      "machine learning", "ai", "programming", "development"
    ];

    techTerms.forEach((term) => {
      if (lowerQuery.includes(term)) {
        keywords.add(term);
      }
    });
  }

  return Array.from(keywords);
}

function generateExplanation(
  query: string,
  keywords: string[],
  bookCount: number
): string {
  if (bookCount === 0) {
    return `"${query}"에 대한 정보를 분석했지만, 현재 관련 교재를 찾지 못했습니다. 다른 키워드로 검색해보세요.`;
  }

  const keywordText = keywords.length > 0
    ? `주요 키워드: ${keywords.join(", ")}`
    : "";

  return `"${query}"에 대한 검색 결과입니다. ${keywordText} - 총 ${bookCount}개의 관련 교재를 찾았습니다.`;
}
