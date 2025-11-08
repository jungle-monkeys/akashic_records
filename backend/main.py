# main.py
"""엔드포인트 및 CLI 테스트용 진입점"""

import argparse
from typing import List, Dict, Any, Optional

from langchain_core.documents import Document

from config import Config
from database_setup import setup_database
from document_processor import DocumentProcessor
from qa_system import QASystem
from vector_store_manager import VectorStoreManager


DEFAULT_PDF_FILES = [
    {"path": "CSAPP_2016.pdf", "name": "CSAPP_2016"},
]
DEFAULT_BATCH_SIZE = 100


class StudyAssistant:
    """PDF -> VectorStore -> QA 파이프라인을 관리하는 헬퍼"""

    def __init__(
        self,
        pdf_files: Optional[List[Dict[str, str]]] = None,
        batch_size: int = DEFAULT_BATCH_SIZE,
    ) -> None:
        self.pdf_files = pdf_files or DEFAULT_PDF_FILES
        self.batch_size = batch_size
        self.processor = DocumentProcessor()
        self.vector_manager = VectorStoreManager()
        self.vector_store = None
        self.qa_system: Optional[QASystem] = None

    def prepare(self, rebuild: bool = False, ingest: bool = False) -> None:
        """데이터베이스/벡터 스토어/QA 시스템 초기화 및 필요 시 재임베딩"""

        print("=" * 60)
        print("📚 전공 서적 AI 학습 시스템 (pgvector + HNSW)")
        print("=" * 60)

        setup_database(Config.POSTGRES_CONNECTION)

        if rebuild:
            documents = self._process_pdfs()
            self.vector_store = self._build_vector_store(documents)
        else:
            loaded = self._try_load_existing_store()
            if not loaded:
                documents = self._process_pdfs()
                self.vector_store = self._build_vector_store(documents)
            elif ingest:
                documents = self._process_pdfs()
                self._append_documents(documents)

        if self.vector_store is None:
            raise RuntimeError("벡터 스토어 초기화에 실패했습니다.")

        self.qa_system = QASystem(self.vector_store)

    def answer(self, question: str, k: int = 5) -> Dict[str, Any]:
        """질문에 대한 답변을 반환 (필요 시 자동 초기화)"""

        if not question:
            raise ValueError("질문이 비어 있습니다.")

        if self.qa_system is None:
            self.prepare(rebuild=False)

        return self.qa_system.answer_question(question, k=k)

    def _process_pdfs(self) -> List[Document]:
        if not self.pdf_files:
            raise ValueError("처리할 PDF 정보가 비어 있습니다.")

        all_documents: List[Document] = []
        for pdf_info in self.pdf_files:
            docs = self.processor.load_and_split_pdf(
                pdf_path=pdf_info["path"],
                book_name=pdf_info["name"],
            )
            all_documents.extend(docs)

        print(f"\n📊 총 처리된 문서: {len(all_documents)}개")
        return all_documents

    def _build_vector_store(self, documents: List[Document]):
        if not documents:
            raise ValueError("벡터 스토어를 생성할 문서가 없습니다.")

        print(f"\n📦 {len(documents)}개 문서를 {self.batch_size}개씩 배치 처리")

        for i in range(0, len(documents), self.batch_size):
            batch = documents[i : i + self.batch_size]
            print(f"처리 중: {i + 1}~{min(i + self.batch_size, len(documents))}개")

            if i == 0:
                self.vector_store = self.vector_manager.create_vector_store(batch)
            else:
                self.vector_manager.add_documents(batch)

        return self.vector_store

    def _append_documents(self, documents: List[Document]) -> None:
        if not documents:
            print("ℹ️ 추가할 문서가 없습니다.")
            return

        if self.vector_store is None:
            raise RuntimeError("벡터 스토어가 초기화되지 않았습니다.")

        print(f"\n➕ 기존 스토어에 {len(documents)}개 문서를 추가합니다.")
        for i in range(0, len(documents), self.batch_size):
            batch = documents[i : i + self.batch_size]
            print(f"  추가 중: {i + 1}~{min(i + self.batch_size, len(documents))}개")
            self.vector_manager.add_documents(batch)

    def _try_load_existing_store(self) -> bool:
        try:
            self.vector_store = self.vector_manager.load_existing_store()
            return True
        except Exception as exc:
            print(f"⚠️ 기존 벡터 스토어 로드 실패, 재생성 시도: {exc}")
            return False


def get_answer(
    question: str,
    *,
    pdf_files: Optional[List[Dict[str, str]]] = None,
    rebuild: bool = False,
    ingest: bool = False,
    batch_size: int = DEFAULT_BATCH_SIZE,
    k: int = 5,
) -> Dict[str, Any]:
    """다른 서비스(예: FastAPI)에서 바로 호출 가능한 헬퍼 함수"""

    assistant = StudyAssistant(pdf_files=pdf_files, batch_size=batch_size)
    assistant.prepare(rebuild=rebuild, ingest=ingest)
    return assistant.answer(question, k=k)


def _print_result(result: Dict[str, Any]) -> None:
    print(f"\n질문: {result['question']}")
    print(f"\n답변:\n{result['answer']}")
    metadata = result.get("metadata", {}) or {}
    references = result.get("references", [])
    if not references:
        best_score = metadata.get("best_score")
        threshold = metadata.get("threshold")
        print("\n📖 참고 자료가 없습니다.")
        if threshold is not None:
            print(
                f"  ↳ 가장 낮은 점수(best_score)={best_score}, "
                f"임계값(threshold)={threshold}"
            )
        fallback_threshold = metadata.get("fallback_threshold")
        if fallback_threshold is not None:
            print(f"  ↳ 보조 임계값(fallback)={fallback_threshold}")
        return

    print("\n📖 참고 자료 및 좌표:")
    for idx, ref in enumerate(references, 1):
        coords = (
            f"x1={ref.get('x1')}, y1={ref.get('y1')}, "
            f"x2={ref.get('x2')}, y2={ref.get('y2')}"
        )
        score = ref.get("score")
        score_text = f", score={score:.4f}" if isinstance(score, float) else ""
        print(
            f"  {idx}. {ref.get('book_name')} - 페이지 {ref.get('page')}, "
            f"청크 {ref.get('chunk_index')} ({coords}{score_text})"
        )
    if metadata.get("confidence") == "low":
        print(
            "\n⚠️ 임계값을 통과하지 못해 보조 임계값으로 검색된 결과입니다. "
            "정확도를 확인해주세요."
        )


def _parse_args():
    parser = argparse.ArgumentParser(description="PDF 기반 QA 시스템 테스트")
    parser.add_argument("-q", "--question", help="질문 (미입력 시 CLI에서 입력)")
    parser.add_argument("--k", type=int, default=5, help="검색할 문서 개수")
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help="PDF 벡터화 시 배치 크기",
    )
    parser.add_argument(
        "--rebuild",
        action="store_true",
        help="기존 벡터 스토어를 무시하고 처음부터 재생성",
    )
    parser.add_argument(
        "--ingest",
        action="store_true",
        help="기존 스토어 유지 + PDF 임베딩만 추가",
    )
    return parser.parse_args()


def call_llm() -> None:
    args = _parse_args()
    assistant = StudyAssistant(batch_size=args.batch_size)
    assistant.prepare(rebuild=args.rebuild, ingest=args.ingest)

    question = args.question or input("질문을 입력하세요: ").strip()
    if not question:
        print("❌ 질문이 필요합니다.")
        return

    result = assistant.answer(question, k=args.k)
    _print_result(result)


if __name__ == "__main__":
    call_llm()
