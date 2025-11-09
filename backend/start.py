#!/usr/bin/env python
"""
PM2용 FastAPI 시작 스크립트
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000)
