# main.py
from database_setup import setup_database
from document_processor import DocumentProcessor
from vector_store_manager import VectorStoreManager
from qa_system import QASystem

# from problem_generator import ProblemGenerator
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
            pdf_path=pdf_info["path"], book_name=pdf_info["name"]
        )
        all_documents.extend(docs)

    print(f"\n📊 총 처리된 문서: {len(all_documents)}개")

    # 3. 벡터 스토어 생성 (HNSW 인덱스 자동 최적화)
    vector_manager = VectorStoreManager()
    vector_store = vector_manager.create_vector_store(all_documents)
    BATCH_SIZE = 100  # 한 번에 100개씩 처리
    print(f"\n📦 {len(all_documents)}개 문서를 {BATCH_SIZE}개씩 배치 처리")

    for i in range(0, len(all_documents), BATCH_SIZE):
        batch = all_documents[i : i + BATCH_SIZE]
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

    question = "What is the average time complexity and worst case of quicksort?"
    result = qa_system.answer_question(question)

    print(f"\nQuestion: {result['question']}")
    print(f"\nAnswer:\n{result['answer']}")
    print(f"\n📖 References:")
    for idx, ref in enumerate(result["references"], 1):
        print(f"  {idx}. {ref['book_name']} - Page {ref['page']}")


if __name__ == "__main__":
    main()
