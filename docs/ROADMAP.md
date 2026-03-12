# ROADMAP: 개인 개발 블로그 (Notion CMS 기반)

> 관련 문서: [PRD.md](./PRD.md) | [PRD-validation.md](./PRD-validation.md)
>
> **MVP 범위**: F001(글 목록), F002(글 상세), F003(카테고리 필터), F005(반응형), F006(다크모드), F007(ISR), F008(SEO) — 7개 기능
>
> **F004(검색)** 는 PRD 기준 "MVP 이후" 항목이나, 블로그 목록 페이지 UX 완성도를 위해 Phase 4에 포함

---

## 전체 일정 한눈에 보기

```
Phase       작업 내용                                일정 (누적)
─────────────────────────────────────────────────────────────────
Phase 1     프로젝트 초기 설정                        1~2일차
Phase 2     공통 모듈 (API 클라이언트, 타입, 컴포넌트)  3~5일차
Phase 3     핵심 기능 (홈·목록·상세 페이지)             6~9일차
Phase 4     추가 기능 (카테고리·검색·SEO)              10~12일차
Phase 5     최적화 및 배포                            13~14일차
─────────────────────────────────────────────────────────────────
총 예상 소요                                          약 2주
```

---

## Phase 1: 프로젝트 초기 설정

> **목표**: Notion API 연결 환경을 갖추고, 블로그용 라우트 그룹 디렉토리 구조를 준비한다.

**예상 소요**: 1~2일

### 세부 작업

- [ ] `@notionhq/client` 패키지 설치
  ```bash
  npm install @notionhq/client
  ```
- [ ] `.env.example`에 Notion 환경변수 추가
  ```bash
  NOTION_API_KEY=your_notion_integration_api_key
  NOTION_DATABASE_ID=your_notion_database_id
  ```
- [ ] `.env.local` 생성 후 실제 키 입력 (`.gitignore` 확인)
- [ ] Notion DB에 `Slug` 속성 추가 (타입: `rich_text`) — [PRD m-04]
- [ ] Notion DB 커버 이미지 **외부 URL** 설정 정책 수립 — [PRD M-03]
  - GitHub raw, Cloudinary, Unsplash 등 만료 없는 외부 URL 사용
  - Notion 내부 파일 URL(`cover.type === "file"`) 직접 사용 금지
- [ ] `app/(blog)/` 라우트 그룹 디렉토리 생성
  ```
  app/
    (blog)/
      layout.tsx          # 블로그 전용 레이아웃 (헤더, 푸터)
      blog/
        page.tsx          # /blog — 글 목록 페이지 (빈 파일)
        [slug]/
          page.tsx        # /blog/[slug] — 글 상세 페이지 (빈 파일)
      category/
        [category]/
          page.tsx        # /category/[category] — 카테고리 페이지 (빈 파일)
  ```
- [ ] `app/page.tsx` 홈 페이지 기본 구조 확인 (기존 파일 활용)

### 완료 기준 (DoD)

- `npm run dev` 실행 후 `/blog`, `/category/test` 경로 접근 시 404가 아닌 페이지 반환
- `npm run lint` 오류 없음
- `@notionhq/client`가 `package.json` dependencies에 추가됨

### 주요 파일/디렉토리

| 파일/디렉토리 | 용도 |
|--------------|------|
| `.env.example` | 환경변수 템플릿 (수정 가능) |
| `.env.local` | 실제 API 키 (Git 제외) |
| `app/(blog)/layout.tsx` | 블로그 섹션 공통 레이아웃 |
| `app/(blog)/blog/page.tsx` | 글 목록 페이지 진입점 |
| `app/(blog)/blog/[slug]/page.tsx` | 글 상세 페이지 진입점 |
| `app/(blog)/category/[category]/page.tsx` | 카테고리 페이지 진입점 |

---

## Phase 2: 공통 모듈

> **목표**: Notion API 클라이언트, 데이터 fetch 함수, TypeScript 타입, 재사용 가능한 블로그 UI 컴포넌트를 구축한다. 이후 Phase에서 이 모듈들을 공통으로 활용한다.

**예상 소요**: 2~3일

### 세부 작업

#### Notion 클라이언트 및 API 래퍼

- [ ] `lib/notion.ts` — Notion 클라이언트 싱글톤 + `withRetry()` 구현 — [PRD m-02]
  ```typescript
  // HTTP 429 응답 시 Retry-After 헤더 값만큼 대기 후 재시도 (최대 3회)
  export async function withRetry<T>(fn: () => Promise<T>): Promise<T>
  ```
- [ ] `lib/notion-api.ts` — 데이터 fetch 함수 구현
  - `fetchPublishedPosts(options?)` — `Status=발행됨` 필터 + `has_more`/`next_cursor` 페이지네이션 — [PRD m-03]
  - `fetchPageMetadata(pageId)` — 1단계: 페이지 속성(메타데이터)만 조회 — [PRD M-01]
  - `fetchPageBlocks(pageId)` — 2단계: 블록 별도 조회 + 중첩 블록 재귀 처리 — [PRD M-01, M-02]
  - `fetchCategories()` — DB 스키마에서 `Category` select 옵션 목록 조회
  - `mapPageToBlogPost(page)` — Notion 응답 → `BlogPost` 타입 변환 (Slug 필드 우선, 폴백: 제목 kebab-case 변환)

#### TypeScript 타입 정의

- [ ] `types/blog.ts` — PRD 섹션 6 기반 타입 정의
  - `BlogPost` — 글 메타데이터 타입
  - `NotionBlock` — 블록 렌더링 타입
  - `NotionRichText` — 리치 텍스트 타입
  - `NotionCodeBlock` — 코드 블록 타입
  - `NotionImageBlock` — 이미지 블록 타입 (`type: "external" | "file"` 구분)

#### 블로그 UI 컴포넌트

- [ ] `components/blog/post-card.tsx` — 글 목록 카드 (제목, 카테고리 badge, 태그 badge, 발행일)
- [ ] `components/blog/category-badge.tsx` — 카테고리 badge (shadcn `badge` 래핑)
- [ ] `components/blog/tag-badge.tsx` — 태그 badge 목록 (shadcn `badge` 래핑)
- [ ] `components/blog/post-skeleton.tsx` — 로딩 상태 플레이스홀더 (shadcn `skeleton` 활용)

### 완료 기준 (DoD)

- Notion API에서 실제 데이터 fetch 성공 (로컬 테스트 스크립트 또는 dev 서버 확인)
- `withRetry()` 함수에 HTTP 429 재시도 로직 포함 확인
- `types/blog.ts` TypeScript 타입 오류 없음 (`npm run lint` 통과)
- 블로그 UI 컴포넌트 Storybook 또는 `/blog` 페이지에서 렌더링 확인

### 주요 파일/디렉토리

| 파일 | 용도 |
|------|------|
| `lib/notion.ts` | Notion 클라이언트 싱글톤 + `withRetry()` |
| `lib/notion-api.ts` | 데이터 fetch 함수 모음 |
| `types/blog.ts` | BlogPost, NotionBlock 등 타입 정의 |
| `components/blog/post-card.tsx` | 글 목록 카드 컴포넌트 |
| `components/blog/category-badge.tsx` | 카테고리 badge |
| `components/blog/tag-badge.tsx` | 태그 badge 목록 |
| `components/blog/post-skeleton.tsx` | 로딩 skeleton |

---

## Phase 3: 핵심 기능 구현

> **목표**: 홈 페이지, 블로그 목록 페이지, 글 상세 페이지를 구현하고 ISR 캐싱을 적용한다.

**예상 소요**: 3~4일

**구현 기능 ID**: F001, F002, F005, F006, F007

### 세부 작업

#### 홈 페이지 (`app/page.tsx`)

- [ ] 최근 발행 글 6개 카드 목록 표시 (`fetchPublishedPosts({ limit: 6 })`)
- [ ] `export const revalidate = 60` — ISR 60초 적용 — [PRD F007]
- [ ] 블로그 소개 헤더 텍스트 + '전체 글 보기' CTA 버튼 (`/blog` 링크)
- [ ] 모바일 1열 / 태블릿 이상 2~3열 그리드 반응형 적용 — [PRD F005]

#### 블로그 목록 페이지 (`app/(blog)/blog/page.tsx`)

- [ ] 전체 발행 글 목록 카드 그리드 (모바일 1열, 태블릿 이상 2열)
- [ ] `export const revalidate = 60` — ISR 60초 적용
- [ ] 결과 없음 빈 상태 UI
- [ ] Phase 4에서 카테고리 필터 + 검색 추가 예정 (마크업 공간 확보)

#### 글 상세 페이지 (`app/(blog)/blog/[slug]/page.tsx`)

- [ ] `generateStaticParams()` 구현 — 발행된 글 slug 목록으로 정적 경로 사전 생성
- [ ] `export const revalidate = 60` — ISR 60초 적용
- [ ] **2단계 API 호출** 구현 — [PRD M-01]
  1. `fetchPageMetadata(pageId)` → 제목, 카테고리, 태그, 발행일
  2. `fetchPageBlocks(pageId)` → 본문 블록 (중첩 블록 재귀, 페이지네이션 처리)
- [ ] 글 없음 / 오류 시 `notFound()` 호출 → 404 처리
- [ ] 글 제목, 카테고리, 태그, 발행일 헤더 영역
- [ ] 뒤로가기 버튼 (`/blog` 링크)

#### Notion 블록 렌더러

- [ ] `components/blog/notion-renderer.tsx` — Notion 블록 → React 컴포넌트 렌더링
  - 지원 블록: `paragraph`, `heading_1/2/3`, `bulleted_list_item`, `numbered_list_item`, `code`, `image`, `quote`, `divider` — [PRD F002]
  - 미지원 블록: 플레인 텍스트 폴백 처리
  - `code` 블록: 언어 표시 + 신택스 하이라이팅 (shadcn/ui `ScrollArea` 또는 라이브러리 검토)
  - `image` 블록: `cover.type === "external"` / `"file"` 분기 처리 — [PRD M-03]
  - Next.js `<Image>` 컴포넌트로 이미지 최적화

### 완료 기준 (DoD)

- 홈 페이지(`/`)에서 최근 글 6개 카드 표시 확인
- 블로그 목록 페이지(`/blog`)에서 전체 발행 글 목록 표시 확인
- 글 상세 페이지(`/blog/[slug]`)에서 Notion 본문 블록 렌더링 확인
- ISR 동작 확인: Notion 글 수정 후 60초 내 블로그 반영 (수동 측정)
- 존재하지 않는 slug 접근 시 404 페이지 반환
- 모바일(375px) 레이아웃 깨짐 없음 확인

### 주요 파일/디렉토리

| 파일 | 용도 |
|------|------|
| `app/page.tsx` | 홈 페이지 (최근 글 6개) |
| `app/(blog)/blog/page.tsx` | 블로그 목록 페이지 |
| `app/(blog)/blog/[slug]/page.tsx` | 글 상세 페이지 |
| `components/blog/notion-renderer.tsx` | Notion 블록 렌더러 |

---

## Phase 4: 추가 기능

> **목표**: 카테고리 페이지, 검색 기능, SEO 메타데이터를 구현하여 블로그 탐색 UX를 완성한다.

**예상 소요**: 2~3일

**구현 기능 ID**: F003, F004, F008

### 세부 작업

#### 카테고리 페이지 (`app/(blog)/category/[category]/page.tsx`) — [PRD F003]

- [ ] `generateStaticParams()` — `fetchCategories()`로 카테고리 목록 사전 생성
- [ ] `export const revalidate = 60` — ISR 60초 적용
- [ ] 선택된 카테고리명 헤더 표시
- [ ] 해당 카테고리 글 카드 그리드 목록 (`has_more`/`next_cursor` 페이지네이션 포함)
- [ ] 전체 카테고리 목록 탭 내비게이션 (다른 카테고리 이동)
- [ ] 글 없음 빈 상태 UI

#### 블로그 목록 페이지 — 카테고리 필터 추가 (`app/(blog)/blog/page.tsx`)

- [ ] 카테고리 필터 탭 (전체 + 카테고리 목록) — 클라이언트 컴포넌트로 분리
- [ ] URL 쿼리 파라미터(`?category=`) 기반 필터 상태 관리

#### 검색 기능 — [PRD F004]

- [ ] `components/blog/search-input.tsx` — 클라이언트 컴포넌트
  - 제목 기반 문자열 포함 검색 (클라이언트 사이드)
  - debounce 300ms 적용
  - 결과 없음 상태 UI
  - MVP 전략: 전체 글 `page_size: 100`으로 한 번에 로드 후 클라이언트 필터링 — [PRD m-01]

#### SEO 메타데이터 — [PRD F008]

- [ ] `app/page.tsx` — 홈 페이지 정적 메타데이터 (`metadata` export)
- [ ] `app/(blog)/blog/page.tsx` — 블로그 목록 정적 메타데이터
- [ ] `app/(blog)/blog/[slug]/page.tsx` — 글 상세 `generateMetadata()` 구현
  - `title`: 글 제목
  - `description`: 글 첫 단락 추출
  - `og:image`: 외부 URL(`cover.type === "external"`)만 사용, 내부 파일 URL 사용 금지 — [PRD M-03]
- [ ] `app/(blog)/category/[category]/page.tsx` — 카테고리 페이지 `generateMetadata()` 구현

### 완료 기준 (DoD)

- 카테고리 페이지(`/category/[category]`)에서 해당 카테고리 글만 필터링 표시 확인
- 블로그 목록 페이지에서 카테고리 탭 클릭 시 필터링 동작 확인
- 검색어 입력 시 300ms debounce 후 제목 기준 실시간 필터링 확인
- 브라우저 개발자 도구에서 각 페이지 `<meta>` 태그(title, description, og:image) 확인
- Lighthouse SEO 점수 확인 (목표: 90점 이상)

### 주요 파일/디렉토리

| 파일 | 용도 |
|------|------|
| `app/(blog)/category/[category]/page.tsx` | 카테고리 페이지 |
| `components/blog/search-input.tsx` | 검색 입력 컴포넌트 |
| `components/blog/category-filter.tsx` | 카테고리 필터 탭 |

---

## Phase 5: 최적화 및 배포

> **목표**: 성능 최적화, 모바일 반응형 최종 점검, Vercel 프로덕션 배포로 MVP를 완성한다.

**예상 소요**: 1~2일

**구현 기능 ID**: F005 (최종 점검)

### 세부 작업

#### 성능 최적화

- [ ] Next.js `<Image>` 컴포넌트 적용 확인 (모든 이미지)
  - `width`, `height` 또는 `fill` 속성 설정
  - `priority` 속성: LCP 대상 이미지(홈 페이지 상단)에 적용
- [ ] 불필요한 클라이언트 컴포넌트 Server Component 전환 검토
- [ ] `next/font`로 폰트 최적화 (기존 Geist 폰트 설정 확인)
- [ ] 코드 분할: 동적 import(`next/dynamic`) 검토 (Notion 렌더러 등 무거운 컴포넌트)

#### 반응형 최종 점검 — [PRD F005]

- [ ] 모바일(375px) 레이아웃 전체 페이지 확인
- [ ] 태블릿(768px) 레이아웃 확인
- [ ] 데스크탑(1280px) 레이아웃 확인
- [ ] 터치 인터랙션, 탭 이동, 가독성(폰트 크기) 점검

#### 다크모드 최종 점검 — [PRD F006]

- [ ] 시스템 다크모드 자동 전환 확인
- [ ] 수동 토글 시 블로그 컴포넌트 모두 올바른 테마 색상 적용 확인
- [ ] 이미지 밝기 필터 등 다크모드 특이 케이스 처리

#### Vercel 배포

- [ ] Vercel 프로젝트 연결 (또는 기존 연결 확인)
- [ ] Vercel 환경변수 설정
  - `NOTION_API_KEY`
  - `NOTION_DATABASE_ID`
- [ ] 프로덕션 빌드 확인
  ```bash
  npm run build
  ```
- [ ] `main` 브랜치 push → Vercel 자동 배포 트리거

#### 성능 측정

- [ ] Google PageSpeed Insights (Mobile) 실행
  - LCP: 2.5초 이하 목표 — [PRD 성공 지표]
  - 모바일 점수: 90점 이상 목표 — [PRD 성공 지표]
- [ ] Notion 글 수정 후 60초 내 블로그 반영 수동 측정 — [PRD 성공 지표]

### 완료 기준 (DoD)

- `npm run build` 오류 없이 완료
- Vercel 프로덕션 URL에서 블로그 정상 동작 확인
- Google PageSpeed Insights Mobile LCP 2.5초 이하
- Google PageSpeed Insights Mobile 점수 90점 이상
- ISR 60초 반영 수동 측정 확인
- F001~F008 기능 명세 최종 체크리스트 확인

### 주요 파일/디렉토리

| 파일/설정 | 용도 |
|----------|------|
| `next.config.ts` | Image 도메인 설정, 빌드 옵션 |
| Vercel 프로젝트 환경변수 | 프로덕션 API 키 |

---

## MVP 기능 명세 최종 체크리스트

> PRD F001~F008 전체 구현 여부 최종 확인

| 기능 ID | 기능명 | Phase | 완료 |
|---------|--------|-------|------|
| **F001** | 글 목록 조회 (Status=발행됨 필터, 페이지네이션) | Phase 2, 3 | ☐ |
| **F002** | 글 상세 조회 (2단계 API, 중첩 블록 재귀, 블록 렌더러) | Phase 2, 3 | ☐ |
| **F003** | 카테고리별 필터링 | Phase 4 | ☐ |
| **F004** | 검색 기능 (제목 기반, debounce 300ms) | Phase 4 | ☐ |
| **F005** | 반응형 디자인 (375px~) | Phase 3, 5 | ☐ |
| **F006** | 다크모드 지원 (next-themes 재사용) | Phase 3, 5 | ☐ |
| **F007** | ISR 캐싱 (revalidate 60초, Rate Limit 재시도) | Phase 2, 3 | ☐ |
| **F008** | SEO 메타데이터 (generateMetadata, OG 이미지 정책) | Phase 4 | ☐ |

---

## PRD 검증 반영 이슈 추적

| 이슈 ID | 등급 | 내용 | 반영 Phase | 완료 |
|---------|------|------|-----------|------|
| M-01 | Major | F002: 2단계 API 호출 구조 (pages API + blocks API 분리) | Phase 2, 3 | ☐ |
| M-02 | Major | F002: 중첩 블록 재귀 처리 및 블록 페이지네이션 구현 | Phase 2, 3 | ☐ |
| M-03 | Major | F008: Notion 내부 이미지 URL 직접 사용 금지, 외부 URL 정책 | Phase 1, 3, 4 | ☐ |
| m-01 | Minor | F004: 클라이언트 검색 전체 로드(`page_size: 100`) 전략 | Phase 4 | ☐ |
| m-02 | Minor | F007: `withRetry()` Rate Limit(초당 3회, 최대 3회 재시도) 구현 | Phase 2 | ☐ |
| m-03 | Minor | F001·F003: `has_more`/`next_cursor` 페이지네이션 처리 | Phase 2 | ☐ |
| m-04 | Minor | 전반: Notion DB `Slug` (rich_text) 필드 추가, 폴백 로직 구현 | Phase 1, 2 | ☐ |
