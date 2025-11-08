// PDF 하이라이트 타입 정의
export interface Highlight {
  page: number;   // 페이지 번호
  x: number;      // 좌측 상단 x 좌표 (픽셀)
  y: number;      // 좌측 상단 y 좌표 (픽셀)
  width: number;  // 너비 (픽셀)
  height: number; // 높이 (픽셀)
  color?: string; // 하이라이트 색상 (옵션, 기본값: rgba(255, 255, 0, 0.4))
}

// PDFViewer 컴포넌트 Props
export interface PDFViewerProps {
  pdfUrl: string;           // PDF 파일 경로 (필수)
  initialPage?: number;     // 초기 페이지 번호 (옵션, 기본값: 1)
  highlights?: Highlight[]; // 하이라이트 목록 (옵션)
}
