# 01. 초기 프로젝트 세팅

**날짜**: 2026-03-15
**단계**: Phase 1 - 프로젝트 생성 및 기본 구조

## 작업 내용

### 프로젝트 초기화
- Next.js 15.1.0 + TypeScript + Tailwind CSS + App Router
- Prisma ORM + SQLite (로컬 개발용)
- Git 초기화

### 기술 스택
| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | SSR + API Routes 통합 |
| 언어 | TypeScript | 타입 안정성 |
| 스타일링 | Tailwind CSS | 빠른 UI 개발 |
| ORM | Prisma | 타입 안전한 DB 접근 |
| DB (로컬) | SQLite | 설정 없이 즉시 사용 |

### 생성된 파일 구조
```
eval_side/
├── CLAUDE.md                    # Claude Code 팀 설정
├── AGENTS.md                    # 에이전트 조율 규칙
├── .claude/
│   ├── agents/ (6개)            # 평가 전문 에이전트
│   └── commands/eval.md         # /eval 슬래시 커맨드
├── prisma/
│   ├── schema.prisma            # DB 스키마
│   ├── seed.ts                  # 시드 데이터
│   └── dev.db                   # SQLite DB 파일
├── src/
│   ├── app/
│   │   ├── layout.tsx           # 루트 레이아웃 (다크 모드)
│   │   ├── page.tsx             # 메인 페이지
│   │   ├── globals.css          # Tailwind 글로벌 스타일
│   │   ├── api/projects/        # REST API
│   │   └── projects/[id]/       # 상세 페이지
│   ├── components/ (6개)        # UI 컴포넌트
│   └── lib/
│       ├── prisma.ts            # Prisma 클라이언트
│       ├── types.ts             # 공통 타입
│       ├── github-analyzer.ts   # GitHub 분석
│       ├── evaluator.ts         # 평가 오케스트레이터
│       ├── report-generator.ts  # 리포트 생성
│       └── evaluators/ (6개)    # 영역별 평가 로직
└── templates/
    └── report-template.md       # 리포트 템플릿
```

### DB 스키마
- **Project**: id, name, description, githubUrl, type, status
- **Evaluation**: 6개 영역별 점수 + 분석 텍스트, 총점, 판정

### 개발 방식
- Claude Code Team Mode (5 workers 병렬 실행)
- worker-1: 프로젝트 초기화 + 백엔드 API
- worker-2: DB 스키마 + 시드 데이터
- worker-3: 프론트엔드 UI
- worker-4: GitHub 분석 엔진
- worker-5: 평가 엔진 코어

## 현재 상태
- 로컬 개발 서버 동작 확인 (localhost:3001)
- 시드 데이터 3개 포함
- SQLite 기반 로컬 환경
