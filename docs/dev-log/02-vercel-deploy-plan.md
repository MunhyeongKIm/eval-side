# 02. Vercel 배포 계획

**날짜**: 2026-03-15
**단계**: Phase 2 - 프로덕션 배포 준비

## 현재 → 목표

| 항목 | 현재 (로컬) | 목표 (Vercel) |
|------|------------|--------------|
| DB | SQLite (파일) | PostgreSQL (클라우드) |
| 호스팅 | localhost | Vercel 서버리스 |
| GitHub API | 토큰 없음 (60 req/h) | 토큰 사용 (5,000 req/h) |
| 도메인 | - | *.vercel.app (무료) |

## 배포 전 필수 작업

### Step 1: DB 전환 (SQLite → PostgreSQL)
- [ ] Vercel Postgres 또는 Neon DB 생성 (무료)
- [ ] prisma/schema.prisma: `provider = "sqlite"` → `"postgresql"`
- [ ] DATABASE_URL 환경변수 업데이트
- [ ] `npx prisma migrate dev` 재실행
- [ ] 시드 데이터 재투입

### Step 2: 환경변수 설정
- [ ] DATABASE_URL (PostgreSQL 연결 문자열)
- [ ] GITHUB_TOKEN (GitHub Personal Access Token)
  - GitHub → Settings → Developer settings → Personal access tokens
  - 필요 권한: public_repo (읽기 전용)

### Step 3: Vercel 프로젝트 설정
- [ ] GitHub repo 생성 및 push
- [ ] Vercel에서 repo import
- [ ] 환경변수 등록 (Vercel Dashboard → Settings → Environment Variables)
- [ ] Build command: `npx prisma generate && next build`
- [ ] Deploy

### Step 4: 배포 후 검증
- [ ] 메인 페이지 접속 확인
- [ ] 프로젝트 제출 테스트
- [ ] 평가 실행 테스트 (텍스트 개념)
- [ ] 평가 실행 테스트 (GitHub URL)
- [ ] 리포트 렌더링 확인

## 비용 분석

### 무료 범위 내 운영 가능
| 서비스 | 플랜 | 무료 한도 | 예상 비용 |
|--------|------|----------|----------|
| Vercel | Hobby | 100GB 대역폭, 6000분 빌드 | $0 |
| Vercel Postgres | Free | 256MB, 60h 컴퓨팅 | $0 |
| GitHub API | Free | 5,000 req/h (토큰) | $0 |
| **합계** | | | **$0/월** |

### 과금 트리거 조건
- 월 100GB 이상 대역폭 → Vercel Pro ($20/월)
- DB 256MB 초과 → Vercel Postgres Pro ($0.30/GB)
- 사이드 프로젝트 수준에서는 도달하기 어려운 수준

## 리스크 및 대응

| 리스크 | 대응 |
|--------|------|
| Cold start 지연 | Vercel 서버리스 특성. Edge Runtime 고려 |
| DB 연결 풀 고갈 | Prisma Accelerate 또는 connection pooling |
| GitHub API rate limit | GITHUB_TOKEN 필수 설정 |
| SQLite → PostgreSQL 호환 | 마이그레이션 시 데이터 타입 확인 |

## 타임라인 (예상)

| 단계 | 예상 소요 |
|------|----------|
| DB 전환 | 15분 |
| GitHub repo + push | 5분 |
| Vercel 배포 | 10분 |
| 검증 | 10분 |
| **합계** | **~40분** |
