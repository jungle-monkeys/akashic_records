# document_processor.py
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import Config

class DocumentProcessor:
    """PDF 문서를 로드하고 청크로 분할"""
    
    def __init__(self, chunk_size: int = Config.CHUNK_SIZE, 
                 chunk_overlap: int = Config.CHUNK_OVERLAP):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def load_and_split_pdf(self, pdf_path: str, book_name: str) -> List[Document]:
        """PDF를 로드하고 페이지 메타데이터와 함께 청크로 분할"""
        print(f"📖 PDF 로딩 중: {pdf_path}")
        
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        
        # 각 페이지를 청크로 분할하면서 페이지 번호 유지
        all_chunks = []
        for page_num, page in enumerate(pages, start=1):
            chunks = self.text_splitter.split_text(page.page_content)
            
            for chunk_idx, chunk in enumerate(chunks):
                doc = Document(
                    page_content=chunk,
                    metadata={
                        "book_name": book_name,
                        "page": page_num,
                        "chunk_index": chunk_idx,
                        "source": pdf_path
                    }
                )
                all_chunks.append(doc)
        
        print(f"✅ 총 {len(all_chunks)}개 청크 생성 (페이지: {len(pages)})")
        return all_chunks
