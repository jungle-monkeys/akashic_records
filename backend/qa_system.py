# qa_system.py
from typing import List, Dict
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
            model=Config.LLM_MODEL, temperature=0, openai_api_key=Config.OPENAI_API_KEY
        )
        # self.llm = ChatOllama(
        #     model=Config.LLM_MODEL,
        #     base_url=Config.OLLAMA_BASE_URL,
        #     temperature=0
        # )

    def answer_question(self, question: str, k: int = 5) -> Dict:
        """질문에 대한 답변 및 레퍼런스 제공"""

        # 관련 문서 검색 (HNSW 인덱스 활용)
        relevant_docs = self.vector_store.similarity_search(question, k=k)

        # 레퍼런스 정보 추출 및 중복 제거
        references = []
        seen_refs = set()

        for doc in relevant_docs:
            book_name = doc.metadata.get("book_name", "Unknown")
            page = doc.metadata.get("page", "Unknown")
            ref_key = f"{book_name}_{page}"

            if ref_key not in seen_refs:
                seen_refs.add(ref_key)
                ref = {
                    "book_name": book_name,
                    "page": page,
                    "content_preview": doc.page_content[:200] + "...",
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

        return {
            "question": question,
            "answer": answer.content,
            "references": references,
        }
