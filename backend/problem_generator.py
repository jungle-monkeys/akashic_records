# problem_generator.py
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_postgres import PGVector
from config import Config

class ProblemGenerator:
    """문제 생성 시스템"""
    
    def __init__(self, vector_store: PGVector):
        self.vector_store = vector_store
        self.llm = ChatOpenAI(
            model=Config.LLM_MODEL,
            temperature=0.7,
            openai_api_key=Config.OPENAI_API_KEY
        )
        # self.llm = ChatOllama(
        #     model=Config.LLM_MODEL,
        #     base_url=Config.OLLAMA_BASE_URL,
        #     temperature=0.7
        # )
    
    def generate_keyword_problems(self, keyword: str, num_problems: int = 5) -> Dict:
        """키워드 기반 문제 생성"""
        print(f"\n🔍 '{keyword}' 키워드 관련 내용 검색 중...")
        
        # 키워드 관련 문서 검색
        relevant_docs = self.vector_store.similarity_search(keyword, k=10)
        
        # 컨텍스트 생성
        context = "\n\n".join([doc.page_content for doc in relevant_docs[:5]])
        
        # 문제 생성 프롬프트
        prompt_template = """다음 교재 내용을 바탕으로 '{keyword}' 키워드와 관련된 {num_problems}개의 문제를 생성해주세요.

교재 내용:
{context}

문제는 다음 형식으로 생성해주세요:
---
문제 1.
유형: [객관식/주관식/서술형]
내용: [문제 내용]
정답: [정답]
해설: [해설]
난이도: [상/중/하]
---

생성된 문제들:"""
        
        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["keyword", "num_problems", "context"]
        )
        
        formatted_prompt = prompt.format(
            keyword=keyword,
            num_problems=num_problems,
            context=context
        )
        
        response = self.llm.invoke(formatted_prompt)
        
        # 레퍼런스 정보 추출 (중복 제거)
        references = []
        seen_refs = set()
        
        for doc in relevant_docs[:5]:
            book_name = doc.metadata.get("book_name", "Unknown")
            page = doc.metadata.get("page", "Unknown")
            ref_key = f"{book_name}_{page}"
            
            if ref_key not in seen_refs:
                seen_refs.add(ref_key)
                references.append({
                    "book_name": book_name,
                    "page": page
                })
        
        return {
            "keyword": keyword,
            "problems": response.content,
            "references": references
        }
    
    def generate_style_based_problems(self, example_problems: str, num_problems: int = 5) -> Dict:
        """유형 기반 문제 생성 (예: 족보 스타일)"""
        print(f"\n📝 제공된 문제 유형 분석 중...")
        
        # 예시 문제에서 키워드 추출
        keyword_prompt = """다음 문제들을 분석하여 핵심 키워드 5개를 추출해주세요:

{example_problems}

키워드만 쉼표로 구분하여 나열해주세요:"""
        
        keyword_extraction = self.llm.invoke(keyword_prompt.format(example_problems=example_problems))
        keywords = keyword_extraction.content.strip()
        
        # 키워드로 관련 문서 검색
        relevant_docs = self.vector_store.similarity_search(keywords, k=10)
        context = "\n\n".join([doc.page_content for doc in relevant_docs[:5]])
        
        # 유사한 스타일의 문제 생성
        style_prompt_template = """다음은 이전에 출제된 문제들입니다:

{example_problems}

---

다음 교재 내용을 참고하여, 위 문제들과 유사한 스타일과 난이도로 {num_problems}개의 새로운 문제를 생성해주세요:

교재 내용:
{context}

---

문제 생성 시 고려사항:
- 출제 스타일과 형식을 최대한 유사하게 유지
- 난이도를 비슷하게 설정
- 문제 유형(객관식, 주관식 등)을 동일하게 유지
- 교재 내용을 기반으로 새로운 문제 생성

생성된 문제들:"""
        
        prompt = PromptTemplate(
            template=style_prompt_template,
            input_variables=["example_problems", "num_problems", "context"]
        )
        
        formatted_prompt = prompt.format(
            example_problems=example_problems,
            num_problems=num_problems,
            context=context
        )
        
        response = self.llm.invoke(formatted_prompt)
        
        # 레퍼런스 정보 (중복 제거)
        references = []
        seen_refs = set()
        
        for doc in relevant_docs[:5]:
            book_name = doc.metadata.get("book_name", "Unknown")
            page = doc.metadata.get("page", "Unknown")
            ref_key = f"{book_name}_{page}"
            
            if ref_key not in seen_refs:
                seen_refs.add(ref_key)
                references.append({
                    "book_name": book_name,
                    "page": page
                })
        
        return {
            "style": "유형 기반 (족보 스타일)",
            "extracted_keywords": keywords,
            "problems": response.content,
            "references": references
        }
