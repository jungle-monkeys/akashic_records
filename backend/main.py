# main.py
from database_setup import setup_database
from document_processor import DocumentProcessor
from vector_store_manager import VectorStoreManager
from qa_system import QASystem
from problem_generator import ProblemGenerator
from config import Config

def main():
    print("=" * 60)
    print("📚 전공 서적 AI 학습 시스템 (pgvector + HNSW)")
    print("=" * 60)
    
    # 1. 데이터베이스 설정
    setup_database(Config.POSTGRES_CONNECTION)
    
    # 2. PDF 문서 로드 및 처리
    processor = DocumentProcessor()
    
    # 여러 PDF 파일 처리 예시
    pdf_files = [
        {"path": "CSAPP_2016.pdf", "name": "CSAPP_2016"},
        # {"path": "textbook2.pdf", "name": "자료구조"},
    ]
    
    all_documents = []
    for pdf_info in pdf_files:
        docs = processor.load_and_split_pdf(
            pdf_path=pdf_info["path"],
            book_name=pdf_info["name"]
        )
        all_documents.extend(docs)
    
    print(f"\n📊 총 처리된 문서: {len(all_documents)}개")
    
    # 3. 벡터 스토어 생성 (HNSW 인덱스 자동 최적화)
    vector_manager = VectorStoreManager()
    # vector_store = vector_manager.create_vector_store(all_documents)
    BATCH_SIZE = 100  # 한 번에 100개씩 처리
    print(f"\n📦 {len(all_documents)}개 문서를 {BATCH_SIZE}개씩 배치 처리")
    
    for i in range(0, len(all_documents), BATCH_SIZE):
        batch = all_documents[i:i+BATCH_SIZE]
        print(f"처리 중: {i+1}~{min(i+BATCH_SIZE, len(all_documents))}개")
        
        if i == 0:
            vector_store = vector_manager.create_vector_store(batch)
        else:
            vector_manager.add_documents(batch)
    
    # 기존 스토어 사용 시:
    # vector_store = vector_manager.load_existing_store()
    
    # 4. Q&A 시스템 테스트
    print("\n" + "=" * 60)
    print("💬 질의응답 시스템 테스트")
    print("=" * 60)
    
    qa_system = QASystem(vector_store)
    
    question = "퀵소트의 평균 시간 복잡도와 최악의 경우는?"
    result = qa_system.answer_question(question)
    
    print(f"\n질문: {result['question']}")
    print(f"\n답변:\n{result['answer']}")
    print(f"\n📖 참고 자료:")
    for idx, ref in enumerate(result['references'], 1):
        print(f"  {idx}. {ref['book_name']} - 페이지 {ref['page']}")
    
    # 5. 문제 생성 시스템 테스트
    print("\n" + "=" * 60)
    print("📝 문제 생성 시스템 테스트")
    print("=" * 60)
    
    problem_gen = ProblemGenerator(vector_store)
    
    # 키워드 기반 문제 생성
    print("\n[1] 키워드 기반 문제 생성")
    keyword_result = problem_gen.generate_keyword_problems(
        keyword="해시 테이블",
        num_problems=3
    )
    print(f"\n키워드: {keyword_result['keyword']}")
    print(f"\n생성된 문제:\n{keyword_result['problems']}")
    print(f"\n📖 참고한 페이지:")
    for ref in keyword_result['references']:
        print(f"  - {ref['book_name']}: 페이지 {ref['page']}")
    
    # 유형 기반 문제 생성 (족보 스타일)
    print("\n[2] 유형 기반 문제 생성 (족보 스타일)")
    example_problems = """
    1. 다음 중 O(log n) 시간 복잡도를 갖는 정렬 알고리즘은?
       ① 버블 정렬  ② 이진 탐색  ③ 선택 정렬  ④ 삽입 정렬
    
    2. 스택을 이용하여 구현할 수 있는 것을 모두 고르시오.
       ① 괄호 검사  ② 함수 호출  ③ 후위 표기식 계산
    """
    
    style_result = problem_gen.generate_style_based_problems(
        example_problems=example_problems,
        num_problems=3
    )
    print(f"\n스타일: {style_result['style']}")
    print(f"추출된 키워드: {style_result['extracted_keywords']}")
    print(f"\n생성된 문제:\n{style_result['problems']}")
    print(f"\n📖 참고한 페이지:")
    for ref in style_result['references']:
        print(f"  - {ref['book_name']}: 페이지 {ref['page']}")
    
    print("\n" + "=" * 60)
    print("✅ 모든 테스트 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()
