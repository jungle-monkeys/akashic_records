# 🌐 포트포워딩 설정 가이드

이 문서는 홈/회사 서버를 외부에서 접속할 수 있도록 공유기 포트포워딩을 설정하는 방법을 설명합니다.

---

## 📋 전체 프로세스

```
인터넷 → 공유기 → 서버
         ↑
    포트포워딩 설정 필요
```

1. **서버 설정** (setup-external-access.sh 실행)
2. **공유기 포트포워딩** (이 문서)
3. **외부 접속 테스트**

---

## 1️⃣ 서버 설정

먼저 서버 측 설정을 완료하세요:

```bash
cd /home/mu-ubuntu/develop/akashic_records
chmod +x setup-external-access.sh
./setup-external-access.sh
```

이 스크립트가 자동으로 수행하는 작업:
- ✅ 방화벽 포트 허용 (80, 443)
- ✅ Nginx 설치 및 리버스 프록시 설정
- ✅ 서버의 사설 IP 및 공인 IP 확인

**중요:** 스크립트 실행 후 표시되는 **사설 IP**를 메모하세요!

---

## 2️⃣ 공유기 포트포워딩 설정

### 단계 1: 공유기 관리자 페이지 접속

브라우저에서 공유기 IP로 접속합니다:

```
일반적인 공유기 IP 주소:
- http://192.168.0.1
- http://192.168.1.1
- http://192.168.219.1  (KT)
- http://10.0.0.1
```

**공유기 IP를 모르는 경우:**

Windows:
```cmd
ipconfig
```
기본 게이트웨이가 공유기 IP입니다.

Linux/Mac:
```bash
ip route | grep default
# 또는
route -n | grep ^0.0.0.0
```

### 단계 2: 포트포워딩 메뉴 찾기

공유기 제조사별 메뉴 이름:

| 제조사 | 메뉴 이름 |
|--------|-----------|
| ipTIME | 고급 설정 → NAT/라우터 관리 → 포트포워드 설정 |
| 공유기 일반 | 설정 → 포트 포워딩 / 가상 서버 |
| KT | 고급 설정 → NAT → 포트 포워딩 |
| LG U+ | 설정 → 네트워크 → 포트 포워딩 |
| SK | 고급 → NAT → 포트 포워딩 |

### 단계 3: 포트포워딩 규칙 추가

다음 규칙을 추가하세요:

#### 📌 HTTP (웹 접속용)

```
규칙 이름: Akashic-HTTP
프로토콜: TCP
외부 포트: 80
내부 IP: [서버의 사설 IP]  (예: 192.168.0.100)
내부 포트: 80
```

#### 📌 HTTPS (SSL 사용 시)

```
규칙 이름: Akashic-HTTPS
프로토콜: TCP
외부 포트: 443
내부 IP: [서버의 사설 IP]
내부 포트: 443
```

### ipTIME 예시 (스크린샷 설명)

1. **고급 설정** 클릭
2. **NAT/라우터 관리** → **포트포워드 설정** 선택
3. **추가** 버튼 클릭
4. 다음 정보 입력:
   ```
   규칙 이름: akashic
   외부 포트: 80
   내부 IP 주소: [서버 IP, 예: 192.168.0.100]
   내부 포트: 80
   프로토콜: TCP
   ```
5. **적용** 클릭
6. 443 포트도 동일하게 추가

### 단계 4: 공유기 재부팅 (선택사항)

일부 공유기는 설정 후 재부팅이 필요합니다.

---

## 3️⃣ 외부 접속 테스트

### 현재 공인 IP 확인

서버에서 실행:
```bash
curl ifconfig.me
```

또는 웹사이트에서 확인:
- https://www.whatismyip.com/
- https://ipconfig.kr/

### 외부에서 접속 테스트

**스마트폰 (Wi-Fi 끄고 모바일 데이터 사용)**
```
http://[공인IP]
```

예시:
```
http://123.456.78.90
```

**친구 컴퓨터나 다른 네트워크**
```
http://[공인IP]
```

### ✅ 성공한 경우

- 프론트엔드 페이지가 정상적으로 표시됨
- `http://[공인IP]/docs` 에서 API 문서 확인 가능

### ❌ 실패한 경우

**연결 거부됨 (Connection Refused)**
→ 서버 방화벽 또는 PM2 프로세스 확인
```bash
# 방화벽 상태
sudo ufw status

# PM2 상태
pm2 status

# Nginx 상태
sudo systemctl status nginx
```

**타임아웃 (Timeout)**
→ 포트포워딩 설정 재확인

**공유기 설정 재확인:**
- 내부 IP가 정확한지 확인
- 포트 번호가 정확한지 확인 (80, 443)
- 프로토콜이 TCP인지 확인

---

## 4️⃣ 고정 IP 설정 (권장)

서버의 사설 IP가 변경되면 포트포워딩이 작동하지 않습니다.
서버에 **고정 IP**를 할당하는 것을 권장합니다.

### 방법 1: 공유기에서 DHCP 예약

1. 공유기 관리 페이지 → DHCP 설정
2. "IP 주소 예약" 또는 "고정 할당" 메뉴
3. 서버의 MAC 주소에 특정 IP 할당

### 방법 2: 서버에서 고정 IP 설정 (Ubuntu)

```bash
# 네트워크 인터페이스 확인
ip a

# netplan 설정 편집
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:  # 또는 실제 인터페이스 이름
      dhcp4: no
      addresses:
        - 192.168.0.100/24  # 원하는 고정 IP
      gateway4: 192.168.0.1  # 공유기 IP
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

```bash
# 적용
sudo netplan apply
```

---

## 5️⃣ 동적 DNS (DDNS) 설정 (선택사항)

공인 IP가 자주 변경되는 경우 DDNS 서비스를 사용하세요.

### 무료 DDNS 서비스

- **No-IP**: https://www.noip.com/
- **DuckDNS**: https://www.duckdns.org/
- **Dynu**: https://www.dynu.com/

### DuckDNS 예시

1. https://www.duckdns.org/ 접속 및 로그인
2. 도메인 생성 (예: `myakashic.duckdns.org`)
3. 서버에 DuckDNS 클라이언트 설치:

```bash
# DuckDNS 디렉토리 생성
mkdir ~/duckdns
cd ~/duckdns

# 업데이트 스크립트 생성
nano duck.sh
```

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=myakashic&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
```

```bash
# 실행 권한 부여
chmod +x duck.sh

# 5분마다 자동 업데이트 설정
crontab -e
```

crontab에 추가:
```
*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
```

이제 `http://myakashic.duckdns.org`로 접속 가능합니다!

---

## 6️⃣ SSL 인증서 설정 (HTTPS) - 선택사항

무료 SSL 인증서를 발급받아 HTTPS로 접속할 수 있습니다.

### Let's Encrypt (Certbot) 사용

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# 도메인이 있는 경우
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

**참고:** Let's Encrypt는 실제 도메인이 필요합니다. DDNS 도메인도 사용 가능합니다.

---

## 🔍 문제 해결

### 포트포워딩이 작동하지 않는 경우

1. **서버 방화벽 확인**
   ```bash
   sudo ufw status
   # 80, 443 포트가 허용되어 있는지 확인
   ```

2. **Nginx 상태 확인**
   ```bash
   sudo systemctl status nginx
   # active (running)인지 확인
   ```

3. **PM2 프로세스 확인**
   ```bash
   pm2 status
   # akashic-backend, akashic-frontend가 online인지 확인
   ```

4. **포트가 열려있는지 확인**
   ```bash
   sudo netstat -tulpn | grep -E ':80|:8000|:8001'
   ```

5. **로컬에서 테스트**
   ```bash
   # 서버에서
   curl http://localhost
   curl http://localhost:8001
   curl http://localhost:8000/api/health
   ```

6. **같은 네트워크에서 사설 IP로 테스트**
   ```
   http://[사설IP]
   예: http://192.168.0.100
   ```

7. **공유기 이중 NAT 확인**
   - 공유기가 2개 이상 연결된 경우 모든 공유기에 포트포워딩 필요

### ISP(인터넷 서비스 제공자) 포트 차단

일부 ISP는 80, 443 포트를 차단합니다.

**해결 방법:**
1. 다른 포트 사용 (예: 8080, 8443)
2. ISP에 문의하여 포트 개방 요청

---

## 📝 체크리스트

배포 전:
- [ ] 서버 설정 스크립트 실행 (`setup-external-access.sh`)
- [ ] 서버의 사설 IP 확인 및 메모
- [ ] 공인 IP 확인 및 메모

포트포워딩:
- [ ] 공유기 관리 페이지 접속 성공
- [ ] 포트 80 포워딩 설정 완료
- [ ] 포트 443 포워딩 설정 완료 (HTTPS용)
- [ ] 공유기 설정 저장 및 재부팅 (필요시)

고급 설정:
- [ ] 서버 고정 IP 설정 완료
- [ ] DDNS 설정 완료 (선택사항)
- [ ] SSL 인증서 설치 완료 (선택사항)

테스트:
- [ ] 로컬 네트워크에서 사설 IP로 접속 성공
- [ ] 외부 네트워크에서 공인 IP로 접속 성공
- [ ] 프론트엔드 정상 작동 확인
- [ ] 백엔드 API 정상 작동 확인 (`/docs`)

---

## 🎉 완료!

외부에서 접속할 수 있는 Akashic Records 서버 구축이 완료되었습니다!

**접속 주소:**
- HTTP: `http://[공인IP]` 또는 `http://[DDNS도메인]`
- HTTPS: `https://[DDNS도메인]` (SSL 설정 시)
