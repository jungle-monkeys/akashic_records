/**
 * PM2 Ecosystem 설정 파일
 * 프론트엔드(Next.js)를 PM2로 관리
 * 백엔드(FastAPI)는 nohup으로 별도 관리 (deploy.sh 참조)
 */

module.exports = {
  apps: [
    {
      // Frontend: Next.js 프로덕션 서버
      name: 'akashic-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 8001',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: '',  // 빈 문자열 = 상대 경로 사용 (Nginx 리버스 프록시)
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
