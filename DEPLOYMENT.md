# 🚀 Akashic Records 배포 가이드

이 문서는 서버에서 Akashic Records 프론트엔드와 백엔드를 배포하는 방법을 설명합니다.

---

## 📋 사전 준비

### 1. 시스템 요구사항

- **OS**: Ubuntu 20.04 이상 (또는 Linux)
- **Node.js**: v22.x (nvm으로 관리)
- **Python**: 3.8 이상
- **PostgreSQL**: 12 이상
- **PM2**: Node.js 프로세스 관리 도구

### 2. PostgreSQL 설치 및 설정

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL 접속
sudo -u postgres psql

# 데이터베이스 생성
CREATE DATABASE textbook_db;

# 사용자 생성 (옵션)
CREATE USER junglemonkeys WITH PASSWORD 'junglemonkeys1!';
GRANT ALL PRIVILEGES ON DATABASE textbook_db TO junglemonkeys;

# 종료
\q
```

### 3. 환경 변수 설정

**루트 `.env` 파일 생성:**

```bash
cd /home/mu-ubuntu/develop/akashic_records
nano .env
```

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-your_actual_api_key_here

# PostgreSQL Connection
POSTGRES_CONNECTION=postgresql://junglemonkeys:junglemonkeys1!@localhost:5432/textbook_db

# Similarity Thresholds
SIMILARITY_THRESHOLD=0.6
SIMILARITY_FALLBACK_THRESHOLD=0.65
```

**프론트엔드 `.env.local` 파일 생성:**

```bash
cd frontend
nano .env.local
```

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🎯 빠른 배포 (자동 스크립트)

### 1. screen 세션 시작 (SSH 연결 끊김 방지)

```bash
# screen 설치 (없는 경우)
sudo apt install screen

# screen 세션 시작
screen -S akashic_deploy
```

### 2. 배포 스크립트 실행

```bash
cd /home/mu-ubuntu/develop/akashic_records
chmod +x deploy.sh
./deploy.sh
```

스크립트가 다음을 자동으로 수행합니다:
- ✅ 로그 디렉토리 생성
- ✅ 환경 변수 파일 확인
- ✅ 백엔드 의존성 설치
- ✅ 벡터 스토어 구축 (선택)
- ✅ 프론트엔드 의존성 설치 및 빌드
- ✅ PM2 설치 확인
- ✅ PM2로 앱 시작

### 3. screen 세션 종료 (백그라운드 실행)

```
Ctrl+A, 그 다음 D 키
```

이제 SSH 연결이 끊겨도 앱은 계속 실행됩니다!

### 4. 나중에 screen 세션 재접속

```bash
screen -r akashic_deploy
```

---

## 🔧 수동 배포 (단계별)

### 1. 백엔드 배포

```bash
cd backend

# Python 가상환경 생성 (옵션)
python3 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 벡터 스토어 초기화 (처음 1회만)
python folder_vectorize.py ../frontend/public

# FastAPI 서버 테스트
python api.py
```

### 2. 프론트엔드 배포

```bash
cd frontend

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (테스트)
npm start
```

### 3. PM2로 프로세스 관리

```bash
cd /home/mu-ubuntu/develop/akashic_records

# PM2로 앱 시작
pm2 start ecosystem.config.js

# PM2 설정 저장 (재부팅 시 자동 시작)
pm2 save

# PM2 시작 스크립트 등록
pm2 startup
# 출력된 명령어를 복사해서 실행
```

---

## 📊 PM2 관리 명령어

### 상태 확인

```bash
pm2 status          # 프로세스 상태 확인
pm2 list            # 프로세스 목록
pm2 monit           # 실시간 모니터링
```

### 로그 확인

```bash
pm2 logs                      # 모든 로그 확인
pm2 logs akashic-backend      # 백엔드 로그만
pm2 logs akashic-frontend     # 프론트엔드 로그만
pm2 logs --lines 100          # 최근 100줄만
```

### 프로세스 제어

```bash
pm2 restart all               # 모든 프로세스 재시작
pm2 restart akashic-backend   # 백엔드만 재시작
pm2 restart akashic-frontend  # 프론트엔드만 재시작

pm2 stop all                  # 모든 프로세스 중지
pm2 delete all                # 모든 프로세스 삭제
```

### 업데이트 후 재배포

```bash
# 코드 업데이트 (git pull 등)
git pull origin main

# 프론트엔드 재빌드
cd frontend
npm install
npm run build

# PM2 재시작
cd ..
pm2 restart all
```

---

## 🌐 서비스 접속

배포 완료 후 다음 URL로 접속할 수 있습니다:

- **프론트엔드**: http://localhost:8001
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

### 외부 접속 (옵션 - Nginx 리버스 프록시)

외부에서 접속하려면 Nginx를 설치하여 리버스 프록시를 설정하세요:

```bash
# Nginx 설치
sudo apt install nginx

# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/akashic
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/akashic /etc/nginx/sites-enabled/

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 🛠️ 문제 해결

### 1. PM2 프로세스가 시작되지 않음

```bash
# 로그 확인
pm2 logs --err

# 프로세스 삭제 후 재시작
pm2 delete all
pm2 start ecosystem.config.js
```

### 2. 백엔드 연결 오류

```bash
# PostgreSQL 실행 확인
sudo systemctl status postgresql

# 벡터 스토어 재생성
cd backend
python folder_vectorize.py ../frontend/public
```

### 3. 프론트엔드 빌드 오류

```bash
# 캐시 삭제 후 재빌드
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### 4. Node.js 버전 문제

```bash
# nvm으로 Node.js 22 사용
nvm use 22

# 기본 버전 설정
nvm alias default 22
```

### 5. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :8000  # 백엔드
sudo lsof -i :8001  # 프론트엔드

# 프로세스 종료
kill -9 <PID>
```

---

## 🔄 서버 재부팅 시 자동 시작

PM2를 서버 재부팅 시 자동으로 시작하도록 설정:

```bash
# PM2 startup 스크립트 생성
pm2 startup

# 위 명령어의 출력 내용을 복사해서 실행
# 예: sudo env PATH=$PATH:/home/mu-ubuntu/.nvm/versions/node/v22.21.1/bin ...

# 현재 PM2 프로세스 저장
pm2 save
```

---

## 📝 체크리스트

배포 전 확인 사항:

- [ ] PostgreSQL 설치 및 실행 중
- [ ] `.env` 파일 설정 완료 (OpenAI API 키 포함)
- [ ] `frontend/.env.local` 파일 설정 완료
- [ ] Node.js 22 설치 (nvm 사용)
- [ ] Python 의존성 설치 완료
- [ ] 벡터 스토어 초기화 완료
- [ ] 프론트엔드 빌드 성공
- [ ] PM2 설치 완료
- [ ] screen 세션에서 배포 스크립트 실행

배포 후 확인 사항:

- [ ] `pm2 status` 명령어로 프로세스 상태 확인
- [ ] http://localhost:8000/api/health 접속 가능
- [ ] http://localhost:8001 접속 가능
- [ ] `pm2 logs` 로 에러 없는지 확인
- [ ] `pm2 save` 로 설정 저장
- [ ] `pm2 startup` 으로 자동 시작 설정

---

## 🎉 배포 완료!

이제 Akashic Records가 서버에서 실행 중입니다!

질문이나 문제가 있으면 로그를 확인하세요:
```bash
pm2 logs
```
