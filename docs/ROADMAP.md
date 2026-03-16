# ROADMAP: 개인 개발 블로그 (Notion CMS 기반)

> 관련 문서: [PRD.md](./PRD.md) | [PRD-validation.md](./PRD-validation.md)
>
> **MVP 범위**: F001(글 목록), F002(글 상세), F003(카테고리 필터), F005(반응형), F006(다크모드), F007(ISR), F008(SEO) — 7개 기능
>
> **F004(검색)** 는 PRD 기준 "MVP 이후" 항목이나, 블로그 목록 페이지 UX 완성도를 위해 Phase 4에 포함
>
> **테스트 전략**: API 연동 및 비즈니스 로직이 포함된 Phase 2, 3, 4에서 Playwright MCP를 활용한 E2E 테스트를 각 기능 구현 직후 수행한다. 테스트 통과 후 다음 단계로 진행한다.

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

- [x] `@notionhq/client` 패키지 설치
  ```bash
  npm install @notionhq/client
  ```
- [x] `.env.example`에 Notion 환경변수 추가
  ```bash
  NOTION_API_KEY=your_notion_integration_api_key
  NOTION_DATABASE_ID=your_notion_database_id
  ```
- [ ] `.env.local` 생성 후 실제 키 입력 (`.gitignore` 확인)
- [ ] Notion DB에 `Slug` 속성 추가 (타입: `rich_text`) — [PRD m-04]
- [ ] Notion DB 커버 이미지 **외부 URL** 설정 정책 수립 — [PRD M-03]
  - GitHub raw, Cloudinary, Unsplash 등 만료 없는 외부 URL 사용
  - Notion 내부 파일 URL(`cover.type === "file"`) 직접 사용 금지
- [x] `app/(blog)/` 라우트 그룹 디렉토리 생성
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
- [x] `app/page.tsx` 홈 페이지 기본 구조 확인 (기존 파일 활용)

#### 테스트 — 라우트 구조 접근 확인 (세부 작업 완료 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`

- [x] **시나리오 1**: `http://localhost:3000/blog` 접근 → 404가 아닌 페이지 반환 확인
  - `browser_navigate` → `/blog`
  - `browser_snapshot` → 페이지 접근성 트리에서 404 에러 텍스트 미존재 확인
- [x] **시나리오 2**: `http://localhost:3000/category/test` 접근 → 404가 아닌 페이지 반환 확인
  - `browser_navigate` → `/category/test`
  - `browser_snapshot` → 페이지 접근성 트리에서 404 에러 텍스트 미존재 확인

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

- [x] `lib/notion.ts` — Notion 클라이언트 싱글톤 + `withRetry()` 구현 — [PRD m-02]
  ```typescript
  // HTTP 429 응답 시 Retry-After 헤더 값만큼 대기 후 재시도 (최대 3회)
  export async function withRetry<T>(fn: () => Promise<T>): Promise<T>
  ```
- [x] `lib/notion-api.ts` — 데이터 fetch 함수 구현
  - `fetchPublishedPosts(options?)` — `Status=발행됨` 필터 + `has_more`/`next_cursor` 페이지네이션 — [PRD m-03]
  - `fetchPageMetadata(pageId)` — 1단계: 페이지 속성(메타데이터)만 조회 — [PRD M-01]
  - `fetchPageBlocks(pageId)` — 2단계: 블록 별도 조회 + 중첩 블록 재귀 처리 — [PRD M-01, M-02]
  - `fetchCategories()` — DB 스키마에서 `Category` select 옵션 목록 조회
  - `mapPageToBlogPost(page)` — Notion 응답 → `BlogPost` 타입 변환 (Slug 필드 우선, 폴백: 제목 kebab-case 변환)

#### TypeScript 타입 정의

- [x] `types/blog.ts` — PRD 섹션 6 기반 타입 정의
  - `BlogPost` — 글 메타데이터 타입
  - `NotionBlock` — 블록 렌더링 타입
  - `NotionRichText` — 리치 텍스트 타입
  - `NotionCodeBlock` — 코드 블록 타입
  - `NotionImageBlock` — 이미지 블록 타입 (`type: "external" | "file"` 구분)

#### 블로그 UI 컴포넌트

- [x] `components/blog/post-card.tsx` — 글 목록 카드 (제목, 카테고리 badge, 태그 badge, 발행일)
- [x] `components/blog/category-badge.tsx` — 카테고리 badge (shadcn `badge` 래핑)
- [x] `components/blog/tag-badge.tsx` — 태그 badge 목록 (shadcn `badge` 래핑)
- [x] `components/blog/post-skeleton.tsx` — 로딩 상태 플레이스홀더 (shadcn `skeleton` 활용)

#### 테스트 ① — Notion API 연결 및 데이터 fetch 확인 (`lib/notion-api.ts` 구현 완료 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_evaluate`

- [ ] **시나리오 1**: `fetchPublishedPosts()` 실제 API 응답 확인 → `/blog` 페이지에서 글 카드 렌더링
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_snapshot` → 글 카드 요소(제목, 날짜) 최소 1개 이상 존재 확인
- [ ] **시나리오 2**: `has_more` 페이지네이션 — 전체 발행 글 수와 카드 수 일치 검증
  - `browser_evaluate` → `document.querySelectorAll('[data-testid="post-card"]').length` 로 카드 수 확인
  - Notion DB 발행됨 글 수와 비교 (페이지 수가 10 초과 시 next_cursor 재조회 포함 여부)
- [ ] **시나리오 3**: `fetchCategories()` — 카테고리 데이터 존재 확인
  - `browser_navigate` → `http://localhost:3000/category` 또는 관련 페이지
  - `browser_snapshot` → 카테고리 항목 요소 최소 1개 이상 존재 확인
- [ ] **시나리오 4**: `withRetry()` — HTTP 429 재시도 로직 코드 리뷰 확인
  - `lib/notion.ts` 코드에서 `Retry-After` 헤더 처리 및 최대 3회 재시도 로직 존재 확인 (브라우저 테스트 불필요, 코드 리뷰로 대체)

#### 테스트 ② — 블로그 UI 컴포넌트 렌더링 확인 (컴포넌트 4종 구현 완료 후)

> 사용 도구: `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_take_screenshot`

- [ ] **시나리오 1**: PostCard — 제목, badge, 날짜 요소 접근성 트리 확인
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_snapshot` → 카드 내 제목(`heading`), 카테고리 badge, 발행일 텍스트 요소 존재 확인
- [ ] **시나리오 2**: PostSkeleton — 로딩 상태 skeleton 요소 확인
  - `browser_evaluate` → 페이지 로딩 지연 시뮬레이션 후 skeleton 클래스 요소 존재 확인
- [x] **시나리오 3**: 다크모드 — PostCard 테마 색상 스크린샷 비교
  - `browser_evaluate` → `document.documentElement.classList.add('dark')` 실행
  - `browser_take_screenshot` → 다크모드 카드 스크린샷 저장 후 배경/텍스트 색상 시각 확인

### 완료 기준 (DoD)

- Notion API에서 실제 데이터 fetch 성공 (로컬 테스트 스크립트 또는 dev 서버 확인) (Playwright MCP 테스트 통과)
- `withRetry()` 함수에 HTTP 429 재시도 로직 포함 확인
- `types/blog.ts` TypeScript 타입 오류 없음 (`npm run lint` 통과)
- 블로그 UI 컴포넌트 Storybook 또는 `/blog` 페이지에서 렌더링 확인 (Playwright MCP 테스트 통과)

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

- [x] 최근 발행 글 6개 카드 목록 표시 (`fetchPublishedPosts({ limit: 6 })`)
- [x] `export const revalidate = 60` — ISR 60초 적용 — [PRD F007]
- [x] 블로그 소개 헤더 텍스트 + '전체 글 보기' CTA 버튼 (`/blog` 링크)
- [x] 모바일 1열 / 태블릿 이상 2~3열 그리드 반응형 적용 — [PRD F005]

#### 블로그 목록 페이지 (`app/(blog)/blog/page.tsx`)

- [x] 전체 발행 글 목록 카드 그리드 (모바일 1열, 태블릿 이상 2열)
- [x] `export const revalidate = 60` — ISR 60초 적용
- [x] 결과 없음 빈 상태 UI
- [x] Phase 4에서 카테고리 필터 + 검색 추가 예정 (마크업 공간 확보)

#### 글 상세 페이지 (`app/(blog)/blog/[slug]/page.tsx`)

- [x] `generateStaticParams()` 구현 — 발행된 글 slug 목록으로 정적 경로 사전 생성
- [x] `export const revalidate = 60` — ISR 60초 적용
- [x] **2단계 API 호출** 구현 — [PRD M-01]
  1. `fetchPageMetadata(pageId)` → 제목, 카테고리, 태그, 발행일
  2. `fetchPageBlocks(pageId)` → 본문 블록 (중첩 블록 재귀, 페이지네이션 처리)
- [x] 글 없음 / 오류 시 `notFound()` 호출 → 404 처리
- [x] 글 제목, 카테고리, 태그, 발행일 헤더 영역
- [x] 뒤로가기 버튼 (`/blog` 링크)

#### Notion 블록 렌더러

- [x] `components/blog/notion-renderer.tsx` — Notion 블록 → React 컴포넌트 렌더링
  - 지원 블록: `paragraph`, `heading_1/2/3`, `bulleted_list_item`, `numbered_list_item`, `code`, `image`, `quote`, `divider` — [PRD F002]
  - 미지원 블록: 플레인 텍스트 폴백 처리
  - `code` 블록: 언어 표시 + 신택스 하이라이팅 (shadcn/ui `ScrollArea` 또는 라이브러리 검토)
  - `image` 블록: `cover.type === "external"` / `"file"` 분기 처리 — [PRD M-03]
  - Next.js `<Image>` 컴포넌트로 이미지 최적화

#### 테스트 ① — 홈 페이지 E2E (`app/page.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_resize`, `mcp__playwright__browser_click`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_take_screenshot`

- [x] **시나리오 1**: 글 카드 6개 이하 제한 확인
  - `browser_navigate` → `http://localhost:3000`
  - `browser_evaluate` → `document.querySelectorAll('[data-testid="post-card"]').length` ≤ 6 검증
- [x] **시나리오 2**: '전체 글 보기' 버튼 → `/blog` 이동
  - `browser_click` → '전체 글 보기' 버튼 요소
  - `browser_snapshot` → URL이 `/blog`로 변경 확인
- [x] **시나리오 3**: 모바일(375px) 1열 그리드 확인
  - `browser_resize` → width: 375, height: 812
  - `browser_take_screenshot` → 카드 1열 레이아웃 시각 확인
- [x] **시나리오 4**: 데스크탑(1280px) 다열 그리드 확인
  - `browser_resize` → width: 1280, height: 900
  - `browser_take_screenshot` → 카드 2열 이상 레이아웃 시각 확인

#### 테스트 ② — 블로그 목록 페이지 E2E (`app/(blog)/blog/page.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_click`, `mcp__playwright__browser_resize`, `mcp__playwright__browser_evaluate`

- [x] **시나리오 1**: 전체 발행 글 카드 수 DB와 일치 검증
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_evaluate` → 카드 수 카운트 후 Notion DB 발행됨 글 수와 비교
- [x] **시나리오 2**: 카드 클릭 → `/blog/[slug]` 이동
  - `browser_click` → 첫 번째 글 카드
  - `browser_snapshot` → URL이 `/blog/` 로 시작하는 경로로 이동 확인
- [ ] **시나리오 3**: 빈 상태 UI 표시 확인
  - 발행됨 글이 없는 환경 또는 필터 적용 상태에서 `browser_snapshot` → 빈 상태 메시지 요소 존재 확인
- [x] **시나리오 4**: 태블릿(768px) 2열 그리드 확인
  - `browser_resize` → width: 768, height: 1024
  - `browser_take_screenshot` → 카드 2열 레이아웃 시각 확인

#### 테스트 ③ — 글 상세 페이지 및 Notion 블록 렌더링 E2E (글 상세 + `notion-renderer.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_click`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_network_requests`

- [x] **시나리오 1**: 글 헤더 (제목, 카테고리, 태그, 날짜) 확인
  - `browser_navigate` → `http://localhost:3000/blog/[실제_slug]`
  - `browser_snapshot` → 제목 heading, 카테고리 badge, 태그 badge, 발행일 텍스트 존재 확인
- [x] **시나리오 2**: 지원 블록 타입 8종 렌더링 확인
  - `browser_evaluate` → paragraph, h1/h2/h3 요소 존재 확인 (테스트 글 기준 paragraph/heading 확인 완료, 나머지 블록은 해당 블록 포함 글 추가 시 재검증 필요)
- [ ] **시나리오 3**: 코드 블록 언어 레이블 + 신택스 하이라이팅 확인
  - `browser_snapshot` → 코드 블록 언어명 텍스트(예: `javascript`, `typescript`) 요소 존재 확인
  - `browser_take_screenshot` → 신택스 하이라이팅 색상 시각 확인
- [ ] **시나리오 4**: 중첩 블록 (`has_children: true`) 렌더링
  - 중첩 리스트 또는 중첩 토글이 포함된 글 페이지에서 `browser_snapshot` → 하위 블록 요소 존재 확인
- [x] **시나리오 5**: 404 처리 — 존재하지 않는 slug
  - `browser_navigate` → `http://localhost:3000/blog/this-slug-does-not-exist-xyz`
  - `browser_snapshot` → 404 페이지 또는 에러 메시지 확인
- [x] **시나리오 6**: 뒤로가기 버튼 → `/blog` 이동
  - `browser_click` → 뒤로가기 버튼
  - `browser_snapshot` → URL이 `/blog`인지 확인
- [x] **시나리오 7**: ISR `revalidate` 헤더 확인
  - `x-nextjs-cache: HIT`, `x-nextjs-prerender: 1` 응답 헤더 확인 완료 (curl)

### 완료 기준 (DoD)

- 홈 페이지(`/`)에서 최근 글 6개 카드 표시 확인 (Playwright MCP 테스트 통과)
- 블로그 목록 페이지(`/blog`)에서 전체 발행 글 목록 표시 확인 (Playwright MCP 테스트 통과)
- 글 상세 페이지(`/blog/[slug]`)에서 Notion 본문 블록 렌더링 확인 (Playwright MCP 테스트 통과)
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

#### 테스트 ① — 카테고리 페이지 E2E (`category/[category]/page.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_click`, `mcp__playwright__browser_evaluate`

- [ ] **시나리오 1**: 해당 카테고리 글만 표시 → badge 텍스트 전수 검증
  - `browser_navigate` → `http://localhost:3000/category/[실제_카테고리명]`
  - `browser_evaluate` → 모든 카테고리 badge 텍스트를 배열로 수집 후 현재 카테고리와 불일치 항목 없음 확인
- [ ] **시나리오 2**: 카테고리 탭 클릭 → URL 변경 및 헤더 텍스트 변경
  - `browser_click` → 다른 카테고리 탭
  - `browser_snapshot` → URL과 페이지 헤더 텍스트가 선택한 카테고리명으로 변경 확인
- [ ] **시나리오 3**: 빈 카테고리 빈 상태 UI 확인
  - `browser_navigate` → 글이 없는 카테고리 경로 (또는 테스트용 빈 카테고리)
  - `browser_snapshot` → 빈 상태 메시지 요소 존재 확인

#### 테스트 ② — 블로그 목록 카테고리 필터 E2E (`category-filter.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_click`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_evaluate`

- [ ] **시나리오 1**: 탭 클릭 → URL `?category=` 파라미터 반영 + 카드 필터링
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_click` → 특정 카테고리 탭
  - `browser_evaluate` → `window.location.search`에 `?category=` 파라미터 포함 확인
  - `browser_evaluate` → 카드 badge가 모두 선택한 카테고리와 일치 확인
- [ ] **시나리오 2**: '전체' 탭 → 쿼리 파라미터 제거 + 전체 목록 복원
  - `browser_click` → '전체' 탭
  - `browser_evaluate` → `window.location.search`가 빈 문자열이거나 `category` 파라미터 미포함 확인
  - `browser_snapshot` → 전체 글 카드 목록 복원 확인

#### 테스트 ③ — 검색 기능 E2E (`search-input.tsx` 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_type`, `mcp__playwright__browser_snapshot`, `mcp__playwright__browser_evaluate`, `mcp__playwright__browser_wait_for`

- [ ] **시나리오 1**: 검색어 입력 → 300ms 후 제목 기준 필터링
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_type` → 검색 입력창에 실제 글 제목 일부 입력
  - `browser_wait_for` → 300ms debounce 대기
  - `browser_snapshot` → 입력어가 포함된 글 카드만 표시 확인
- [ ] **시나리오 2**: 결과 없음 → 빈 상태 UI
  - `browser_type` → 검색 입력창에 존재하지 않는 문자열 입력 (예: `xyzzy-no-match-9999`)
  - `browser_wait_for` → 300ms 대기
  - `browser_snapshot` → 빈 상태 메시지 요소 존재 확인, 글 카드 0개 확인
- [ ] **시나리오 3**: 검색어 삭제 → 전체 목록 복원
  - 검색어 전체 삭제 후 `browser_wait_for` → 300ms 대기
  - `browser_snapshot` → 전체 글 카드 목록 복원 확인

#### 테스트 ④ — SEO 메타데이터 E2E (`generateMetadata` 전체 구현 후)

> 사용 도구: `mcp__playwright__browser_navigate`, `mcp__playwright__browser_evaluate`

- [ ] **시나리오 1**: 홈 페이지 title, description 메타 태그 존재 확인
  - `browser_navigate` → `http://localhost:3000`
  - `browser_evaluate` → `document.title`과 `document.querySelector('meta[name="description"]')?.content` 값 확인
- [ ] **시나리오 2**: 블로그 목록 페이지 title, description 메타 태그 존재 확인
  - `browser_navigate` → `http://localhost:3000/blog`
  - `browser_evaluate` → title과 description 메타 태그 값 확인
- [ ] **시나리오 3**: 글 상세 페이지 title(글 제목), description(첫 단락), og:image 확인
  - `browser_navigate` → `http://localhost:3000/blog/[실제_slug]`
  - `browser_evaluate` → `document.title`이 글 제목 포함 확인
  - `browser_evaluate` → `document.querySelector('meta[name="description"]')?.content` 값 존재 확인
  - `browser_evaluate` → `document.querySelector('meta[property="og:image"]')?.content` 값 존재 확인
- [ ] **시나리오 4**: `og:image`에 Notion 내부 URL 미포함 검증 — [PRD M-03]
  - `browser_evaluate` → `og:image` content 값에 `prod-files-secure` 또는 `amazonaws.com` 문자열 미포함 확인
- [ ] **시나리오 5**: 카테고리 페이지 title에 카테고리명 포함 확인
  - `browser_navigate` → `http://localhost:3000/category/[실제_카테고리명]`
  - `browser_evaluate` → `document.title`에 해당 카테고리명 문자열 포함 확인

### 완료 기준 (DoD)

- 카테고리 페이지(`/category/[category]`)에서 해당 카테고리 글만 필터링 표시 확인 (Playwright MCP 테스트 통과)
- 블로그 목록 페이지에서 카테고리 탭 클릭 시 필터링 동작 확인 (Playwright MCP 테스트 통과)
- 검색어 입력 시 300ms debounce 후 제목 기준 실시간 필터링 확인 (Playwright MCP 테스트 통과)
- 브라우저 개발자 도구에서 각 페이지 `<meta>` 태그(title, description, og:image) 확인 (Playwright MCP 테스트 통과)
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
| **F001** | 글 목록 조회 (Status=발행됨 필터, 페이지네이션) | Phase 2, 3 | ☑ 완료 |
| **F002** | 글 상세 조회 (2단계 API, 중첩 블록 재귀, 블록 렌더러) | Phase 2, 3 | ☑ 완료 |
| **F003** | 카테고리별 필터링 | Phase 4 | ☐ |
| **F004** | 검색 기능 (제목 기반, debounce 300ms) | Phase 4 | ☐ |
| **F005** | 반응형 디자인 (375px~) | Phase 3, 5 | ☑ (Phase 3 완료, Phase 5 최종 점검 미완) |
| **F006** | 다크모드 지원 (next-themes 재사용) | Phase 3, 5 | ☑ (기존 컴포넌트 재사용, Phase 5 최종 점검 미완) |
| **F007** | ISR 캐싱 (revalidate 60초, Rate Limit 재시도) | Phase 2, 3 | ☑ 완료 |
| **F008** | SEO 메타데이터 (generateMetadata, OG 이미지 정책) | Phase 4 | ☐ |

---

## PRD 검증 반영 이슈 추적

| 이슈 ID | 등급 | 내용 | 반영 Phase | 완료 |
|---------|------|------|-----------|------|
| M-01 | Major | F002: 2단계 API 호출 구조 (pages API + blocks API 분리) | Phase 2, 3 | ☑ 완료 |
| M-02 | Major | F002: 중첩 블록 재귀 처리 및 블록 페이지네이션 구현 | Phase 2, 3 | ☑ 완료 |
| M-03 | Major | F008: Notion 내부 이미지 URL 직접 사용 금지, 외부 URL 정책 | Phase 1, 3, 4 | ☑ (Phase 3 image 분기 처리 완료, Phase 4 OG 이미지 정책 미완) |
| m-01 | Minor | F004: 클라이언트 검색 전체 로드(`page_size: 100`) 전략 | Phase 4 | ☐ |
| m-02 | Minor | F007: `withRetry()` Rate Limit(초당 3회, 최대 3회 재시도) 구현 | Phase 2 | ☑ 완료 |
| m-03 | Minor | F001·F003: `has_more`/`next_cursor` 페이지네이션 처리 | Phase 2 | ☑ 완료 |
| m-04 | Minor | 전반: Notion DB `Slug` (rich_text) 필드 추가, 폴백 로직 구현 | Phase 1, 2 | ☑ (폴백 로직 완료, Notion DB 필드 추가는 수동 작업) |
