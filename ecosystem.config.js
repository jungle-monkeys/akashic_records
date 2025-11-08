/**
 * PM2 Ecosystem 설정 파일
 * 프론트엔드(Next.js)와 백엔드(FastAPI)를 PM2로 관리
 */

module.exports = {
  apps: [
    {
      // Backend: FastAPI 서버
      name: 'akashic-backend',
      script: 'uvicorn',
      args: 'api:app --host 0.0.0.0 --port 8000',
      cwd: './backend',
      interpreter: 'python3',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
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
        NEXT_PUBLIC_API_URL: 'http://localhost:8000',
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
