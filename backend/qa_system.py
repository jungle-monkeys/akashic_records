# qa_system.py
from typing import Dict, Any
from langchain_openai import ChatOpenAI

# from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_postgres import PGVector
from config import Config


class QASystem:
    """질의응답 시스템"""

    def __init__(self, vector_store: PGVector):
        self.vector_store = vector_store
        self.llm = ChatOpenAI(
            model=Config.LLM_MODEL,
            temperature=0,
            openai_api_key=Config.OPENAI_API_KEY
        )
        # pgvector는 코사인 거리를 score로 반환하므로 값이 낮을수록 유사도가 높다.
        self.similarity_threshold = Config.SIMILARITY_THRESHOLD
        self.fallback_threshold = Config.SIMILARITY_FALLBACK_THRESHOLD

    def answer_question(self, question: str, k: int = 5) -> Dict[str, Any]:
        """질문에 대한 답변 및 레퍼런스(좌표, 문서 원문 포함) 제공"""

        # 관련 문서 검색 (HNSW 인덱스 활용)
        search_results = self.vector_store.similarity_search_with_score(question, k=k)

        if self.similarity_threshold is not None:
            filtered_results = [
                (doc, score)
                for doc, score in search_results
                if score <= self.similarity_threshold
            ]
        else:
            filtered_results = search_results

        confidence = "high"

        no_doc_message = (
            "죄송합니다. 충분히 유사한 교재 내용을 찾지 못했습니다. "
            "다른 질문이나 더 구체적인 내용을 시도해주세요."
        )

        if not filtered_results:
            fallback_results = []
            if self.fallback_threshold is not None:
                fallback_results = [
                    (doc, score)
                    for doc, score in search_results
                    if score <= self.fallback_threshold
                ]

            if fallback_results:
                filtered_results = fallback_results
                confidence = "low"
            else:
                best_score = search_results[0][1] if search_results else None
                return {
                    "question": question,
                    "answer": no_doc_message,
                    "references": [],
                    "metadata": {
                        "reason": "no_similar_document",
                        "threshold": self.similarity_threshold,
                        "fallback_threshold": self.fallback_threshold,
                        "best_score": best_score,
                    },
                }

        relevant_docs = [doc for doc, _ in filtered_results]

        # 레퍼런스 정보 추출 및 중복 제거
        references = []
        seen_refs = set()

        for doc, score in filtered_results:
            metadata = doc.metadata or {}
            book_name = metadata.get("book_name", "Unknown")
            page = metadata.get("page", "Unknown")
            chunk_index = metadata.get("chunk_index")
            source = metadata.get("source")
            ref_key = f"{book_name}_{page}_{chunk_index}_{source}"

            if ref_key in seen_refs:
                continue

            seen_refs.add(ref_key)
            bbox = metadata.get("bbox") or {}

            ref = {
                "book_name": book_name,
                "page": page,
                "chunk_index": chunk_index,
                "source": source,
                "document": doc.page_content,
                "content_preview": doc.page_content[:200] + "...",
                "page_width": metadata.get("page_width"),
                "page_height": metadata.get("page_height"),
                "bbox": bbox,
                "x1": bbox.get("x1"),
                "y1": bbox.get("y1"),
                "x2": bbox.get("x2"),
                "y2": bbox.get("y2"),
                "score": score,
                "metadata": metadata,
            }

            references.append(ref)

        # 컨텍스트 생성
        context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # 프롬프트 생성
        prompt_template = """다음 교재 내용을 바탕으로 질문에 정확하게 답변해주세요.

교재 내용:
{context}

질문: {question}

답변 (교재 내용을 기반으로 상세하게 설명):"""

        prompt = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )

        # LLM으로 답변 생성
        formatted_prompt = prompt.format(context=context, question=question)
        answer = self.llm.invoke(formatted_prompt)
        
        metadata = {
            "confidence": confidence,
            "threshold": self.similarity_threshold,
            "fallback_threshold": self.fallback_threshold,
        }

        return {
            "question": question,
            "answer": answer.content,
            "references": references,
            "metadata": metadata,

        }
