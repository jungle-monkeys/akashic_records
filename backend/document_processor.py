# document_processor.py
# from typing import List
# from langchain_core.documents import Document
# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from config import Config

# class DocumentProcessor:
#     """PDF 문서를 로드하고 청크로 분할"""
    
#     def __init__(self, chunk_size: int = Config.CHUNK_SIZE, 
#                  chunk_overlap: int = Config.CHUNK_OVERLAP):
#         self.text_splitter = RecursiveCharacterTextSplitter(
#             chunk_size=chunk_size,
#             chunk_overlap=chunk_overlap,
#             length_function=len,
#             separators=["\n\n", "\n", " ", ""]
#         )
    
#     def load_and_split_pdf(self, pdf_path: str, book_name: str) -> List[Document]:
#         """PDF를 로드하고 페이지 메타데이터와 함께 청크로 분할"""
#         print(f"📖 PDF 로딩 중: {pdf_path}")
        
#         loader = PyPDFLoader(pdf_path)
#         pages = loader.load()
        
#         # 각 페이지를 청크로 분할하면서 페이지 번호 유지
#         all_chunks = []
#         for page_num, page in enumerate(pages, start=1):
#             chunks = self.text_splitter.split_text(page.page_content)
            
#             for chunk_idx, chunk in enumerate(chunks):
#                 doc = Document(
#                     page_content=chunk,
#                     metadata={
#                         "book_name": book_name,
#                         "page": page_num,
#                         "chunk_index": chunk_idx,
#                         "source": pdf_path
#                     }
#                 )
#                 all_chunks.append(doc)
        
#         print(f"✅ 총 {len(all_chunks)}개 청크 생성 (페이지: {len(pages)})")
#         return all_chunks

from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import fitz  # PyMuPDF
from config import Config

class DocumentProcessor:
    """PDF 문서를 로드하고 좌표와 함께 청크로 분할"""
    def __init__(self, chunk_size: int = Config.CHUNK_SIZE,
                chunk_overlap: int = Config.CHUNK_OVERLAP):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\\n\\n", "\\n", " ", ""]
        )

    def load_and_split_pdf(self, pdf_path: str, book_name: str) -> List[Document]:
        """PDF 로드 + 좌표 추출 + 청크 분할"""
        print(f"📖 PDF 로딩 중: {pdf_path}")

        pdf_document = fitz.open(pdf_path)
        all_chunks = []

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]

            # 페이지 텍스트 추출
            page_text = page.get_text()

            # 단어별 좌표 추출 (나중에 매칭용)
            words = page.get_text("words")  # (x0, y0, x1, y1, "word", ...)

            # 청크로 분할
            chunks = self.text_splitter.split_text(page_text)

            for chunk_idx, chunk in enumerate(chunks):
                # 🔑 청크의 bounding box 계산
                bbox = self._find_chunk_bbox(chunk, words)

                doc = Document(
                    page_content=chunk,
                    metadata={
                        "book_name": book_name,
                        "page": page_num + 1,
                        "chunk_index": chunk_idx,
                        "source": pdf_path,
                        # 🆕 좌표 정보 저장
                        "bbox": bbox,
                        "page_width": page.rect.width,
                        "page_height": page.rect.height
                    }
                )
                all_chunks.append(doc)

        pdf_document.close()
        print(f"✅ 총 {len(all_chunks)}개 청크 생성 (좌표 포함)")
        return all_chunks

    def _find_chunk_bbox(self, chunk_text: str, words: List) -> dict:
        """청크에 해당하는 bounding box 계산"""
        # 청크의 첫/마지막 몇 단어로 위치 찾기
        chunk_words = chunk_text.split()[:5] + chunk_text.split()[-5:]

        matching_coords = []
        for word_info in words:
            x1, y1, x2, y2, word = word_info[:5]
            if any(cw in word for cw in chunk_words):
                matching_coords.append((x1, y1, x2, y2))

        if matching_coords:
            x1 = min(c[0] for c in matching_coords)
            y1 = min(c[1] for c in matching_coords)
            x2 = max(c[2] for c in matching_coords)
            y2 = max(c[3] for c in matching_coords)

            return {
                "x1": float(x1),
                "y1": float(y1),
                "x2": float(x2),
                "y2": float(y2),
                "width": float(x2 - x1),
                "height": float(y2 - y1)
            }

        return None
