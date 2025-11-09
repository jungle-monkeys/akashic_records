#!/bin/bash

###############################################################################
# Akashic Records 외부 접속 설정 스크립트
# 1. 서버 방화벽 설정
# 2. Nginx 설치 및 리버스 프록시 설정
###############################################################################

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "======================================================================"
echo "🌐 Akashic Records 외부 접속 설정"
echo "======================================================================"
echo ""

# 1. 서버 정보 확인
echo "======================================================================"
echo "📊 1단계: 서버 정보 확인"
echo "======================================================================"

# 사설 IP 확인
PRIVATE_IP=$(hostname -I | awk '{print $1}')
echo -e "${BLUE}사설 IP:${NC} $PRIVATE_IP"

# 공인 IP 확인
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "확인 불가")
echo -e "${BLUE}공인 IP:${NC} $PUBLIC_IP"

echo ""
echo -e "${YELLOW}⚠️  이 정보를 메모해두세요!${NC}"
echo ""

# 2. 방화벽 설정
echo "======================================================================"
echo "🔥 2단계: 방화벽 설정 (UFW)"
echo "======================================================================"

# UFW 상태 확인
UFW_STATUS=$(sudo ufw status | grep -c "Status: active" || echo "0")

if [ "$UFW_STATUS" = "0" ]; then
    echo -e "${YELLOW}UFW가 비활성화되어 있습니다.${NC}"
    echo "UFW를 활성화하시겠습니까? (y/n)"
    read -r ENABLE_UFW

    if [ "$ENABLE_UFW" = "y" ]; then
        # SSH 포트 먼저 허용 (SSH 연결 끊김 방지)
        echo "SSH 포트 허용 중..."
        sudo ufw allow 22/tcp

        # UFW 활성화
        sudo ufw --force enable
        echo -e "${GREEN}✅ UFW 활성화 완료${NC}"
    fi
fi

# 포트 허용
echo ""
echo "필요한 포트를 허용합니다..."

# HTTP (80)
echo "HTTP 포트 (80) 허용 중..."
sudo ufw allow 80/tcp

# HTTPS (443) - 나중에 SSL 사용 시
echo "HTTPS 포트 (443) 허용 중..."
sudo ufw allow 443/tcp

# 백엔드 포트 (8000) - 직접 접근용 (선택사항)
echo "백엔드 API 직접 접근을 허용하시겠습니까? (y/n)"
read -r ALLOW_BACKEND
if [ "$ALLOW_BACKEND" = "y" ]; then
    sudo ufw allow 8000/tcp
    echo -e "${GREEN}✅ 백엔드 포트 (8000) 허용${NC}"
fi

# 프론트엔드 포트 (8001) - 직접 접근용 (선택사항)
echo "프론트엔드 직접 접근을 허용하시겠습니까? (y/n)"
read -r ALLOW_FRONTEND
if [ "$ALLOW_FRONTEND" = "y" ]; then
    sudo ufw allow 8001/tcp
    echo -e "${GREEN}✅ 프론트엔드 포트 (8001) 허용${NC}"
fi

# 방화벽 상태 확인
echo ""
echo "현재 방화벽 규칙:"
sudo ufw status numbered

# 3. Nginx 설치
echo ""
echo "======================================================================"
echo "🔧 3단계: Nginx 설치"
echo "======================================================================"

if ! command -v nginx &> /dev/null; then
    echo "Nginx를 설치하시겠습니까? (y/n)"
    read -r INSTALL_NGINX

    if [ "$INSTALL_NGINX" = "y" ]; then
        echo "Nginx 설치 중..."
        sudo apt update
        sudo apt install -y nginx
        echo -e "${GREEN}✅ Nginx 설치 완료${NC}"
    else
        echo -e "${YELLOW}Nginx 설치를 건너뜁니다.${NC}"
        echo -e "${YELLOW}외부 접속을 위해서는 Nginx 또는 다른 리버스 프록시가 필요합니다.${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Nginx가 이미 설치되어 있습니다.${NC}"
fi

# 4. Nginx 설정
echo ""
echo "======================================================================"
echo "⚙️  4단계: Nginx 리버스 프록시 설정"
echo "======================================================================"

# Nginx 설정 파일 생성
NGINX_CONFIG="/etc/nginx/sites-available/akashic"

echo "Nginx 설정 파일을 생성합니다..."

sudo tee $NGINX_CONFIG > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;  # 모든 도메인 허용 (나중에 실제 도메인으로 변경)

    # 클라이언트 최대 업로드 크기 (PDF 등)
    client_max_body_size 100M;

    # 프론트엔드 (Next.js)
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 백엔드 API (FastAPI)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 문서 (FastAPI Docs)
    location /docs {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # OpenAPI JSON
    location /openapi.json {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
EOF

echo -e "${GREEN}✅ Nginx 설정 파일 생성 완료${NC}"

# 심볼릭 링크 생성
if [ ! -f "/etc/nginx/sites-enabled/akashic" ]; then
    echo "Nginx 사이트 활성화 중..."
    sudo ln -s $NGINX_CONFIG /etc/nginx/sites-enabled/
    echo -e "${GREEN}✅ Nginx 사이트 활성화 완료${NC}"
fi

# 기본 사이트 비활성화 (선택사항)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "기본 Nginx 사이트를 비활성화하시겠습니까? (y/n)"
    read -r DISABLE_DEFAULT
    if [ "$DISABLE_DEFAULT" = "y" ]; then
        sudo rm /etc/nginx/sites-enabled/default
        echo -e "${GREEN}✅ 기본 사이트 비활성화 완료${NC}"
    fi
fi

# Nginx 설정 테스트
echo ""
echo "Nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx 설정 테스트 통과${NC}"

    # Nginx 재시작
    echo "Nginx를 재시작합니다..."
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✅ Nginx 재시작 완료${NC}"
else
    echo -e "${RED}❌ Nginx 설정에 오류가 있습니다.${NC}"
    exit 1
fi

# 5. 완료 및 다음 단계 안내
echo ""
echo "======================================================================"
echo -e "${GREEN}✅ 서버 설정 완료!${NC}"
echo "======================================================================"
echo ""
echo "📋 서버 정보:"
echo "   - 사설 IP: $PRIVATE_IP"
echo "   - 공인 IP: $PUBLIC_IP"
echo ""
echo "🔥 방화벽 상태:"
sudo ufw status | grep -E "80|443|8000|8001"
echo ""
echo "======================================================================"
echo "📝 다음 단계: 공유기 포트포워딩 설정"
echo "======================================================================"
echo ""
echo "공유기 관리자 페이지에서 다음 포트를 포워딩하세요:"
echo ""
echo "  ┌─────────────────────────────────────────────────────┐"
echo "  │ 외부 포트  →  내부 IP        →  내부 포트          │"
echo "  ├─────────────────────────────────────────────────────┤"
echo "  │    80     →  $PRIVATE_IP  →     80    (HTTP)      │"
echo "  │   443     →  $PRIVATE_IP  →    443    (HTTPS)     │"
echo "  └─────────────────────────────────────────────────────┘"
echo ""
echo "포트포워딩 설정 방법:"
echo "  1. 공유기 관리자 페이지 접속 (보통 192.168.0.1 또는 192.168.1.1)"
echo "  2. '포트포워딩' 또는 '가상서버' 메뉴 찾기"
echo "  3. 위 표의 포트 규칙 추가"
echo "  4. 저장 및 재부팅"
echo ""
echo "======================================================================"
echo "🌐 접속 테스트"
echo "======================================================================"
echo ""
echo "로컬 네트워크에서 테스트:"
echo "  - http://$PRIVATE_IP"
echo ""
echo "외부 네트워크에서 테스트 (포트포워딩 설정 후):"
echo "  - http://$PUBLIC_IP"
echo ""
echo "======================================================================"
echo ""
