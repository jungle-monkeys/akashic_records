#!/bin/bash

###############################################################################
# Akashic Records 배포 스크립트
# PM2를 사용하여 프론트엔드와 백엔드를 배포합니다.
###############################################################################

set -e  # 에러 발생 시 스크립트 중단

echo "======================================================================"
echo "🚀 Akashic Records 배포 시작"
echo "======================================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리 확인
PROJECT_ROOT=$(pwd)
echo "📁 프로젝트 경로: $PROJECT_ROOT"

# 로그 디렉토리 생성
echo ""
echo "📂 로그 디렉토리 생성..."
mkdir -p logs
mkdir -p backend/logs
mkdir -p frontend/logs

# 환경 변수 파일 확인
echo ""
echo "🔍 환경 변수 파일 확인..."
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env 파일이 없습니다!${NC}"
    echo "예시 .env 파일을 생성합니다..."
    cat > .env << 'EOF'
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# PostgreSQL Connection
POSTGRES_CONNECTION=postgresql://junglemonkeys:junglemonkeys1!@localhost:5432/textbook_db

# Similarity Thresholds
SIMILARITY_THRESHOLD=0.6
SIMILARITY_FALLBACK_THRESHOLD=0.65
EOF
    echo -e "${YELLOW}⚠️  .env 파일을 편집하여 API 키를 설정하세요.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ .env 파일 확인 완료${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local 파일이 없습니다. 생성합니다...${NC}"
    cat > frontend/.env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✅ frontend/.env.local 파일 생성 완료${NC}"
fi

# 백엔드 설정
echo ""
echo "======================================================================"
echo "🔧 백엔드 설정"
echo "======================================================================"

cd backend

# Python 가상환경 확인 (옵션)
if [ ! -d "venv" ]; then
    echo "Python 가상환경이 없습니다. 생성하시겠습니까? (y/n)"
    read -r CREATE_VENV
    if [ "$CREATE_VENV" = "y" ]; then
        echo "📦 Python 가상환경 생성 중..."
        python3 -m venv venv
        source venv/bin/activate
    fi
else
    echo "📦 기존 가상환경 활성화..."
    source venv/bin/activate 2>/dev/null || echo "가상환경 없이 진행..."
fi

# 백엔드 의존성 설치
echo ""
echo "📦 백엔드 의존성 설치..."
pip install -r requirements.txt --quiet

# 벡터 스토어 확인
echo ""
echo "🔍 벡터 스토어 확인..."
echo "벡터 스토어를 재생성하시겠습니까? (y/n)"
echo "(처음 배포하거나 PDF가 변경된 경우 'y'를 입력하세요)"
read -r REBUILD_VECTOR

if [ "$REBUILD_VECTOR" = "y" ]; then
    echo "🔨 벡터 스토어 재생성 중..."
    python folder_vectorize.py ../frontend/public
else
    echo "기존 벡터 스토어를 사용합니다."
fi

cd "$PROJECT_ROOT"

# 프론트엔드 설정
echo ""
echo "======================================================================"
echo "⚛️  프론트엔드 설정"
echo "======================================================================"

cd frontend

# Node.js 의존성 설치
echo ""
echo "📦 프론트엔드 의존성 설치..."
npm install

# 프론트엔드 빌드
echo ""
echo "🔨 프론트엔드 빌드 중..."
npm run build

cd "$PROJECT_ROOT"

# PM2 설치 확인
echo ""
echo "======================================================================"
echo "🔍 PM2 설치 확인"
echo "======================================================================"

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2가 설치되어 있지 않습니다.${NC}"
    echo "PM2를 전역으로 설치하시겠습니까? (y/n)"
    read -r INSTALL_PM2
    if [ "$INSTALL_PM2" = "y" ]; then
        echo "📦 PM2 설치 중..."
        npm install -g pm2
    else
        echo -e "${RED}❌ PM2가 필요합니다. 배포를 중단합니다.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ PM2가 설치되어 있습니다.${NC}"
fi

# PM2로 앱 시작
echo ""
echo "======================================================================"
echo "🚀 PM2로 애플리케이션 시작"
echo "======================================================================"

# 기존 프로세스 중지
echo "기존 프로세스 중지 중..."
pm2 delete all 2>/dev/null || echo "중지할 프로세스가 없습니다."

# 새 프로세스 시작
echo ""
echo "새 프로세스 시작 중..."
pm2 start ecosystem.config.js

# PM2 저장 (재부팅 시 자동 시작)
echo ""
echo "💾 PM2 설정 저장..."
pm2 save

# PM2 시작 스크립트 등록 (선택사항)
echo ""
echo "서버 재부팅 시 PM2를 자동으로 시작하시겠습니까? (y/n)"
read -r AUTO_START
if [ "$AUTO_START" = "y" ]; then
    pm2 startup
    echo -e "${YELLOW}위 명령어를 복사해서 실행하세요.${NC}"
fi

# 상태 확인
echo ""
echo "======================================================================"
echo "📊 배포 상태 확인"
echo "======================================================================"
pm2 status

echo ""
echo "======================================================================"
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo "======================================================================"
echo ""
echo "🌐 서비스 접속 정보:"
echo "   - 프론트엔드: http://localhost:8001"
echo "   - 백엔드 API: http://localhost:8000"
echo "   - API 문서: http://localhost:8000/docs"
echo ""
echo "📊 유용한 PM2 명령어:"
echo "   - 상태 확인: pm2 status"
echo "   - 로그 확인: pm2 logs"
echo "   - 재시작: pm2 restart all"
echo "   - 중지: pm2 stop all"
echo "   - 삭제: pm2 delete all"
echo "   - 모니터링: pm2 monit"
echo ""
echo "======================================================================"
