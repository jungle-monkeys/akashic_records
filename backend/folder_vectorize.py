"""Standalone CLI to vectorize every PDF under a folder into pgvector."""

import argparse
from pathlib import Path
from typing import Dict, List

from main import DEFAULT_BATCH_SIZE, StudyAssistant


def _list_pdfs(folder: str) -> List[Dict[str, str]]:
    target = Path(folder).expanduser().resolve()
    if not target.exists():
        raise FileNotFoundError(f"경로를 찾을 수 없습니다: {target}")
    if not target.is_dir():
        raise NotADirectoryError(f"폴더 경로가 아닙니다: {target}")

    pdfs = sorted(p for p in target.rglob("*.pdf") if p.is_file())
    if not pdfs:
        raise ValueError(f"{target} 내에 PDF 파일이 없습니다.")

    return [{"path": str(path), "name": path.stem} for path in pdfs]


def vectorize_folder(folder: str, batch_size: int, rebuild: bool) -> None:
    pdf_files = _list_pdfs(folder)
    print(f"📁 대상 폴더: {Path(folder).resolve()}")
    print(f"📄 감지된 PDF: {len(pdf_files)}개")

    assistant = StudyAssistant(pdf_files=pdf_files, batch_size=batch_size)
    assistant.prepare(rebuild=rebuild, ingest=not rebuild)
    print("\n🎉 벡터화가 완료되었습니다.")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="폴더 내 모든 PDF를 벡터 DB에 등록합니다."
    )
    parser.add_argument("folder", help="PDF가 위치한 폴더 경로")
    parser.add_argument(
        "--append",
        action="store_true",
        help="기존 벡터 스토어를 유지하고 추가로 임베딩합니다.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
        help="PDF 임베딩 시 사용할 배치 크기",
    )
    return parser.parse_args()


def main() -> None:
    args = _parse_args()
    vectorize_folder(folder=args.folder, batch_size=args.batch_size, rebuild=not args.append)


if __name__ == "__main__":
    main()


'''
Usage

python backend/folder_vectorize.py <폴더경로>: 폴더(하위 폴더 포함) 안의 모든 PDF를 스캔해 벡터 DB를 새로 생성합니다. 기존 컬렉션은 초기화됩니다.
python backend/folder_vectorize.py <폴더경로> --append: 기존 벡터 DB를 유지한 채 지정 폴더의 PDF만 추가 임베딩합니다.
공통 옵션: --batch-size <N>으로 임베딩 배치 크기를 조정할 수 있습니다 (기본 100).
'''
