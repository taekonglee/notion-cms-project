# Development Guidelines — Notion CMS Blog

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Notion CMS 기반 개인 개발 블로그 |
| 프레임워크 | Next.js 16.1.6 (App Router) |
| 언어 | TypeScript 5 (strict mode) |
| 스타일 | Tailwind CSS v4 + shadcn/ui (new-york, neutral) |
| CMS | Notion API (`@notionhq/client`) |
| 배포 | Vercel (ISR, revalidate 60초) |
| 참조 문서 | `docs/PRD.md`, `docs/ROADMAP.md` |

---

## 2. 디렉토리 구조 및 파일 역할

```
app/
  layout.tsx                        # RootLayout — Providers, Geist 폰트 (Server)
  page.tsx                          # / — 블로그 홈 (최근 글 6개) (Server)
  globals.css                       # Tailwind v4 CSS 변수 및 테마
  (blog)/
    layout.tsx                      # 블로그 공통 레이아웃 (Server)
    blog/
      page.tsx                      # /blog — 전체 글 목록 (Server)
      [slug]/
        page.tsx                    # /blog/[slug] — 글 상세 (Server)
  (dashboard)/
    layout.tsx                      # 대시보드 레이아웃 (Server)
    dashboard/page.tsx              # /dashboard (Server)
    analytics/page.tsx              # /analytics (Server)
    settings/page.tsx               # /settings (Client)
  category/
    [category]/
      page.tsx                      # /category/[category] — 카테고리별 목록 (Server)

lib/
  utils.ts                          # cn() — clsx + tailwind-merge
  notion.ts                         # Notion 클라이언트 싱글톤 + withRetry()
  notion-api.ts                     # Notion 데이터 fetch 함수 모음

types/
  blog.ts                           # BlogPost, NotionBlock 등 타입 정의

components/
  providers.tsx                     # ThemeProvider + Toaster (Client)
  layout/
    header.tsx                      # sticky 헤더, ThemeToggle, MobileNav (Client)
    sidebar.tsx                     # usePathname 활성 링크, onNavClick prop (Client)
    mobile-nav.tsx                  # Sheet 기반 드로어, Sidebar 재사용 (Client)
    footer.tsx                      # 저작권 + 기술스택 링크 (Server)
  blog/
    post-card.tsx                   # 글 목록 카드 (Server)
    category-badge.tsx              # 카테고리 badge (Server)
    tag-badge.tsx                   # 태그 badge 목록 (Server)
    post-skeleton.tsx               # 로딩 skeleton (Server)
    notion-renderer.tsx             # Notion 블록 → React 렌더러 (Server)
    search-input.tsx                # 검색 입력 (Client — debounce 300ms)
    category-filter.tsx             # 카테고리 필터 탭 (Client)
  ui/                               # shadcn/ui 자동 생성 — 직접 수정 금지
```

### 라우트 그룹 규칙

- `(blog)`, `(dashboard)` 괄호 그룹은 URL에 영향을 주지 않는다
- `/blog` URL → `app/(blog)/blog/page.tsx`
- `/category/[category]` URL → `app/(blog)/category/[category]/page.tsx`
- `/dashboard` URL → `app/(dashboard)/dashboard/page.tsx`

---

## 3. 코드 작성 규칙

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수/함수 | camelCase | `fetchPublishedPosts`, `blogPost` |
| 클래스/타입/인터페이스 | PascalCase | `BlogPost`, `NotionBlock` |
| 파일명 | kebab-case | `post-card.tsx`, `notion-api.ts` |
| CSS 클래스 | Tailwind 유틸리티 | `cn("flex items-center gap-3")` |

### JSDoc 필수 조건

- 모든 export 함수에 JSDoc 주석 작성 (`@param`, `@returns` 포함)
- 컴포넌트 상단에 역할 설명 주석 추가

```typescript
/**
 * 발행된 글 목록을 Notion DB에서 조회합니다.
 * @param options - 페이지네이션 옵션 (startCursor, pageSize)
 * @returns BlogPost 배열과 페이지네이션 정보
 */
export async function fetchPublishedPosts(options?: FetchOptions) { ... }
```

### 로깅 규칙

- `console.log` 사용 금지
- 에러 로깅: `console.error` 또는 프로젝트 로거 사용
- 모든 catch 블록에서 에러를 반드시 기록 (무시 금지)

```typescript
// ❌ 금지
console.log("데이터:", data);

// ✅ 허용
console.error("[fetchPublishedPosts] Notion API 오류:", error);
```

### 들여쓰기

- 스페이스 2칸 고정

---

## 4. Server / Client Component 판단 기준

### Server Component (기본값)

- `"use client"` 없으면 자동으로 Server Component
- 다음 파일은 반드시 Server Component 유지:
  - `app/layout.tsx`, `app/page.tsx`
  - `app/(blog)/layout.tsx`, `app/(blog)/blog/page.tsx`, `app/(blog)/blog/[slug]/page.tsx`
  - `app/(blog)/category/[category]/page.tsx`
  - `components/blog/post-card.tsx`, `notion-renderer.tsx`, `post-skeleton.tsx`
  - `components/layout/footer.tsx`

### Client Component 필수 대상

- `useState`, `useEffect`, `usePathname`, `useRouter` 사용 시
- 이벤트 핸들러 직접 포함 시
- 반드시 파일 최상단에 `"use client"` 선언

```typescript
// Client Component 필수 파일
// components/blog/search-input.tsx — useState, debounce
// components/blog/category-filter.tsx — useState, useRouter
// components/layout/header.tsx — ThemeToggle, MobileNav
// components/layout/sidebar.tsx — usePathname
// app/(dashboard)/settings/page.tsx
```

### 하이드레이션 패턴

- 클라이언트 전용 값 렌더링 시 `useEffect + setState` 대신 `useSyncExternalStore` 사용

```typescript
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
```

---

## 5. Notion API 구현 규칙 ⚠️ 핵심

### 클라이언트 초기화 (`lib/notion.ts`)

```typescript
import { Client } from "@notionhq/client";

export const notionClient = new Client({ auth: process.env.NOTION_API_KEY });
export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";
```

### withRetry() — 모든 API 호출에 필수 적용

- HTTP 429 수신 시 `Retry-After` 헤더 값만큼 대기 후 재시도
- 최대 3회 재시도
- Notion API 제한: 초당 평균 3개 요청

```typescript
export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isRateLimit =
        typeof error === "object" && error !== null &&
        "status" in error && (error as { status: number }).status === 429;
      if (isRateLimit && attempt < maxRetries) {
        const retryAfter =
          "headers" in error
            ? Number((error as { headers?: { "retry-after"?: string } }).headers?.["retry-after"] ?? 1)
            : 1;
        await new Promise((res) => setTimeout(res, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("최대 재시도 횟수 초과");
}
```

### 글 상세 조회 — 2단계 API 호출 필수 [PRD M-01]

```
1단계: notionClient.pages.retrieve({ page_id }) → 메타데이터(제목, 카테고리, 태그)
2단계: notionClient.blocks.children.list({ block_id: pageId }) → 본문 블록
```

- **절대로 1단계만으로 본문을 조회하지 않는다**
- pages API 응답에 본문 블록이 포함되지 않음

### 블록 페이지네이션 처리 필수 [PRD M-02]

```typescript
let allBlocks = [];
let cursor: string | undefined = undefined;
do {
  const response = await withRetry(() =>
    notionClient.blocks.children.list({ block_id: pageId, start_cursor: cursor })
  );
  allBlocks.push(...response.results);
  cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
} while (cursor);
```

### 중첩 블록 재귀 처리 필수 [PRD M-02]

- `has_children: true` 블록은 해당 블록 ID로 동일 API 재귀 호출

### 글 목록 페이지네이션 [PRD m-03]

- `has_more: true` 시 `next_cursor`로 추가 조회
- `fetchPublishedPosts()`, `fetchCategoryPosts()` 모두 적용

### 카테고리 목록 조회

- `notionClient.databases.retrieve({ database_id })` 로 DB 스키마에서 `Category` select 옵션 동적 수집
- 하드코딩 금지

### Slug 생성 로직 [PRD m-04]

1. Notion DB의 `Slug` (rich_text) 필드 값 우선 사용
2. Slug 필드 없으면 제목 kebab-case 변환으로 폴백

```typescript
function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
```

---

## 6. 스타일링 규칙

### Tailwind CSS v4

- `tailwind.config.js` 파일 생성 금지 — 설정은 `globals.css` CSS 변수로만
- `@import "tailwindcss"` 방식 사용 (`@tailwind base/components/utilities` 금지)
- 다크모드: `.dark` 클래스 방식 (`@custom-variant dark (&:is(.dark *))`)
- 색상: `oklch` 색상 시스템 + CSS 변수 사용

### cn() 유틸 필수 사용

```typescript
import { cn } from "@/lib/utils";

// ✅ 올바른 사용
className={cn("flex items-center", isActive && "bg-primary", className)}

// ❌ 금지 — 문자열 직접 연결
className={"flex items-center " + (isActive ? "bg-primary" : "")}
```

### CSS 변수 토큰 활용

- 색상: `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`
- 사이드바: `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-accent`
- 직접 색상 값 (`bg-gray-100`) 사용 지양, CSS 변수 토큰 우선

---

## 7. shadcn/ui 사용 규칙

### 설치된 컴포넌트 (18개) — 추가 설치 없이 바로 사용

| 컴포넌트 | 블로그 활용 용도 |
|---------|----------------|
| `badge` | 카테고리, 태그 표시 |
| `button` | CTA, 뒤로가기 버튼 |
| `card` | 글 목록 카드 |
| `input` | 검색 입력창 |
| `skeleton` | 로딩 플레이스홀더 |
| `separator` | divider 블록 렌더링 |
| `scroll-area` | 코드 블록, 긴 본문 |
| `breadcrumb` | 글 상세 경로 표시 |
| `sheet` | 모바일 드로어 |
| `tooltip` | 태그 설명 |

### 규칙

- `components/ui/` 파일 직접 수정 금지
- 새 컴포넌트 추가: `npx shadcn@latest add <component-name>`
- 새 컴포넌트 추가 전 기존 18개로 해결 가능한지 먼저 검토

---

## 8. ISR / SEO 구현 규칙

### ISR — 모든 블로그 페이지 필수 [PRD F007]

```typescript
// 블로그 관련 모든 page.tsx 최상단에 반드시 포함
export const revalidate = 60;
```

적용 대상:
- `app/page.tsx`
- `app/(blog)/blog/page.tsx`
- `app/(blog)/blog/[slug]/page.tsx`
- `app/(blog)/category/[category]/page.tsx`

### generateStaticParams() 필수 파일

```typescript
// app/(blog)/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await fetchPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// app/(blog)/category/[category]/page.tsx
export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((cat) => ({ category: cat.name }));
}
```

### SEO 메타데이터 [PRD F008]

- 정적 페이지: `export const metadata: Metadata = { ... }` 사용
- 동적 페이지: `export async function generateMetadata({ params })` 사용
- og:image: **반드시 외부 URL만 사용** (`cover.type === "external"` 검사 필수)

```typescript
// ✅ 올바른 og:image 처리
const ogImage = cover?.type === "external" ? cover.external.url : undefined;

// ❌ 금지 — Notion 내부 파일 URL 직접 사용
const ogImage = cover.file.url; // expiry_time 만료로 이미지 깨짐 발생
```

---

## 9. 환경 변수 규칙

- `.env.local` 직접 수정/생성 금지 — `.env.example`만 수정
- 필수 환경 변수:

```bash
# .env.example
NOTION_API_KEY=your_notion_integration_api_key
NOTION_DATABASE_ID=your_notion_database_id
```

- 환경 변수 접근: `process.env.NOTION_API_KEY` (서버 사이드 전용)
- Client Component에서 Notion 환경 변수 접근 금지

---

## 10. 파일 동시 수정 규칙

| 수정 대상 | 동시 수정 필요 파일 |
|----------|-------------------|
| 블로그 라우트 추가 | `app/(blog)/` 하위 page.tsx + `components/layout/sidebar.tsx` navItems |
| 새 Notion 타입 추가 | `types/blog.ts` + `lib/notion-api.ts` mapPageToBlogPost() |
| shadcn/ui 컴포넌트 추가 | `components.json` 자동 업데이트 (npx shadcn 명령으로만) |
| 환경 변수 추가 | `.env.example` + `CLAUDE.md` 또는 `README.md` 문서화 |
| `lib/notion.ts` 수정 | `lib/notion-api.ts` 영향 범위 확인 필수 |
| `types/blog.ts` 수정 | `lib/notion-api.ts`, `components/blog/post-card.tsx` 타입 체크 |

---

## 11. AI 의사결정 기준

### Notion API 호출 방식 선택

```
글 목록 필요? → fetchPublishedPosts() (withRetry 포함)
글 메타데이터 필요? → fetchPageMetadata(pageId) (1단계)
글 본문 필요? → fetchPageBlocks(pageId) (2단계, 반드시 별도 호출)
카테고리 목록 필요? → fetchCategories() (DB 스키마 조회)
```

### Server vs Client Component 선택

```
useState / useEffect / 이벤트 핸들러 있음? → "use client" 추가
usePathname / useRouter 있음? → "use client" 추가
위 조건 없음? → Server Component 유지 (기본값)
```

### 새 컴포넌트 위치 결정

```
블로그 기능 전용? → components/blog/
레이아웃 관련? → components/layout/
shadcn/ui 래핑? → components/ui/ (npx shadcn 명령으로만)
범용 유틸? → lib/
```

### 스타일 적용 우선순위

```
1. Tailwind 유틸리티 클래스 + cn()
2. CSS 변수 토큰 (--foreground, --muted 등)
3. globals.css 커스텀 클래스 (최후 수단)
4. 인라인 style 속성 금지
```

---

## 12. 금지 사항 ⛔

### Notion API 관련

- `og:image`에 Notion 내부 파일 URL 사용 (`cover.type === "file"` URL 직접 노출)
- 글 상세 조회 시 pages API 단독 호출로 본문 렌더링 시도
- `withRetry()` 없이 Notion API 직접 호출
- `has_more: true` 무시하고 첫 페이지만 반환

### 파일/환경 관련

- `.env.local` 직접 수정
- `components/ui/` 파일 직접 수정
- `tailwind.config.js` 파일 생성
- `package.json` dependencies 변경 전 사용자 알림 없이 진행

### 코드 품질

- `console.log` 사용
- catch 블록에서 에러 무시 (빈 catch 금지)
- 인라인 style 속성 사용
- 클래스 문자열 직접 연결 (`"flex " + condition ? "..." : "..."`)
- Client Component에서 서버 전용 환경 변수 접근
- 미지원 Notion 블록 타입 렌더링 시 에러 throw (플레인 텍스트 폴백 처리 필수)

### 아키텍처

- `(blog)`, `(dashboard)` 라우트 그룹 혼용 (블로그 기능은 반드시 `(blog)` 그룹 내)
- Server Component에 `"use client"` 불필요하게 추가
- ISR `revalidate` 누락
- `generateStaticParams()` 없이 동적 라우트 페이지 생성
