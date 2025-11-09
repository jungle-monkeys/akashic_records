import { AnalysisResult } from "@/types/Textbook";

// Backend API URL
// 빈 문자열 = 상대 경로 사용 (Nginx 리버스 프록시를 통해 /api로 접근)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Real LLM service - Backend API 연동
 */
export async function analyzeLearningQuery(
  query: string
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        k: 5, // 검색할 문서 개수
      }),
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Backend 응답을 Frontend 형식으로 변환
    return {
      query: data.query,
      keywords: data.keywords,
      recommendedBooks: data.recommendedBooks,
      explanation: data.answer, // Backend의 answer -> Frontend의 explanation
    };
  } catch (error) {
    console.error("❌ Backend API 호출 실패:", error);

    // Fallback: Mock 데이터로 대체
    console.warn("⚠️ Mock 데이터로 대체합니다.");
    return analyzeLearningQueryMock(query);
  }
}

/**
 * Fallback Mock LLM service (Backend 연결 실패 시 사용)
 */
async function analyzeLearningQueryMock(query: string): Promise<AnalysisResult> {
  const { searchTextbooks } = await import("./mockData");

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple keyword extraction
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
