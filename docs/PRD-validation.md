# PRD 기술 검증 보고서: 개인 개발 블로그 (Notion CMS 기반)

---

## 1. 검증 개요

| 항목 | 내용 |
|------|------|
| 검증 일시 | 2026-03-10 |
| 검증 대상 | PRD v1.0.0 (MVP) — 개인 개발 블로그 (Notion CMS 기반) |
| 검증 방법 | Notion 공식 API 문서 WebFetch + 알려진 API 동작 기반 추론 |
| 검증 범위 | F001 ~ F008 전체 기능 + 7개 핵심 검증 포인트 |
| 검증자 | Claude Code (AI 기술 검증) |

### 검증에 사용된 API 문서 URL

1. `https://developers.notion.com/reference/intro` — API 기본 정보, 페이지네이션, 인증
2. `https://developers.notion.com/reference/post-database-query` — 데이터베이스 쿼리, 필터, 정렬
3. `https://developers.notion.com/reference/retrieve-a-page` — 페이지 조회, 이미지 URL 만료
4. `https://developers.notion.com/reference/get-block-children` — 블록 자식 조회, 지원 블록 타입
5. `https://developers.notion.com/reference/post-search` — 검색 API 범위 및 제한
6. `https://developers.notion.com/reference/request-limits` — Rate Limit 정책

### 태그 범례

- `[FACT]` — WebFetch로 직접 확인된 사실
- `[INFERENCE]` — 로직/패턴으로 추론된 내용
- `[UNCERTAIN]` — 불확실하여 추가 검증 필요
- `[ASSUMPTION]` — 가정 (검증 전)

---

## 2. Notion API 공식 문서 조사 결과

### 2-1. `reference/intro` — API 기본 정보

`[FACT]` Notion API Base URL은 `https://api.notion.com`이며 HTTPS 필수이다.

`[FACT]` 인증은 Integration Token(통합 토큰) 방식을 사용하며, 워크스페이스 관리자가 발급한다.

`[FACT]` 기본 페이지네이션은 한 번의 API 호출당 **10개 항목** 반환이며, `page_size` 최대값은 **100**이다.

`[FACT]` 모든 응답 객체는 `snake_case` 속성명을 사용하며 날짜/시간은 ISO 8601 형식이다.

`[FACT]` 지원 오브젝트 타입: Page, Database, Block, User, Comment

### 2-2. `reference/post-database-query` — 데이터베이스 쿼리

`[FACT]` 복합 필터는 `and`/`or` 연산자로 다중 조건 결합이 가능하다.

`[FACT]` 정렬은 데이터베이스 속성 또는 페이지 타임스탬프 기준으로 가능하며, 배열 내 순서가 우선순위를 결정한다.

`[FACT]` 페이지네이션 응답에 `next_cursor`와 `has_more` 필드가 포함된다.

`[FACT]` `filter_properties` 파라미터로 반환할 속성 ID를 제한할 수 있다.

`[INFERENCE]` `select` 타입 속성에 대해 `equals` 연산자가 지원된다 (체크박스의 `equals` 지원이 문서에서 확인되었으므로, select 필터도 동일 패턴 적용).

### 2-3. `reference/retrieve-a-page` — 페이지 조회

`[FACT]` 이 엔드포인트는 **페이지 속성만 반환**하며, 페이지 본문(블록)은 포함하지 않는다.

`[FACT]` 이미지/파일 URL 응답 객체에는 `url`과 `expiry_time` 필드가 포함되어 있어, **Notion 내부 이미지 URL은 만료(expire)된다.**

`[FACT]` 응답 구조: `object`, `id`, `created_time`, `last_edited_time`, `properties`, `cover`, `icon`, `url`, `public_url` 등

`[FACT]` `cover` 필드에서 커버 이미지 정보를 가져올 수 있다.

`[FACT]` `relation` 속성은 26개 이상 시 `has_more: true`로 잘리며, 속성당 최대 25개 참조만 반환된다.

### 2-4. `reference/get-block-children` — 블록 자식 조회

`[FACT]` 엔드포인트: `GET /v1/blocks/{block_id}/children`

`[FACT]` 지원 블록 타입 30개 이상:
  - 텍스트: `paragraph`, `heading_1`, `heading_2`, `heading_3`, `quote`, `callout`, `code`, `equation`
  - 리스트: `bulleted_list_item`, `numbered_list_item`, `to_do`, `toggle`
  - 미디어: `image`, `video`, `audio`, `pdf`, `file`, `embed`, `bookmark`
  - 구조: `column_list`, `column`, `table`, `table_row`, `divider`
  - 기타: `unsupported` (미지원 블록은 이 타입으로 반환됨)

`[FACT]` 중첩 블록을 완전히 가져오려면 `has_children: true`인 블록에 대해 **재귀적으로 동일 API를 호출**해야 한다.

`[FACT]` 응답에 `next_cursor`, `has_more` 필드가 포함되어 페이지네이션을 지원한다.

### 2-5. `reference/post-search` — 검색 API

`[FACT]` 검색 API는 **제목(title)에 쿼리 문자열이 포함된** 페이지 또는 데이터베이스만 반환한다.

`[FACT]` 본문(block 내용) 검색은 지원하지 않는다.

`[FACT]` `filter` 파라미터로 `page` 또는 `database` 타입으로 결과를 제한할 수 있다.

`[FACT]` 특정 데이터베이스 내 검색은 `Query a database` 엔드포인트 사용을 권장한다.

### 2-6. `reference/request-limits` — Rate Limit

`[FACT]` 기본 Rate Limit: **초당 평균 3개 요청 (3 requests per second)**

`[FACT]` 제한 초과 시 HTTP **429** 상태 코드와 `"rate_limited"` 에러를 반환한다.

`[FACT]` 응답 헤더 `Retry-After` 값(초 단위 정수)만큼 대기 후 재요청을 권장한다.

`[FACT]` 크기 제한: 페이로드 최대 1,000개 블록 요소, 500KB, 텍스트 2,000자, URL 2,000자

---

## 3. 기능별 기술 검증

---

### F001 — 글 목록 조회 (Status=발행됨 필터)

#### Chain of Thought

**관찰**: PRD는 Notion DB를 쿼리하여 `Status` select 필드가 "발행됨"인 항목만 필터링하고, `Published` 날짜 기준 내림차순으로 정렬하며, 페이지당 최대 10개를 반환하도록 요구한다.

**추론**:
- `[FACT]` 데이터베이스 쿼리 API는 `filter`, `sorts`, `page_size` 파라미터를 지원한다.
- `[INFERENCE]` `select` 속성에 대한 `equals` 필터는 아래 구조로 구현 가능하다:
  ```json
  {
    "filter": {
      "property": "Status",
      "select": { "equals": "발행됨" }
    }
  }
  ```
- `[FACT]` 정렬은 속성 또는 타임스탬프 기준으로 가능하며, `Published` 날짜 속성 기준 `descending` 정렬이 가능하다.
- `[FACT]` `page_size` 파라미터로 최대 100까지 설정 가능하며, 10개 제한도 지원된다.
- `[FACT]` 10개 초과 시 `has_more: true`, `next_cursor`로 다음 페이지 조회 가능.

**근거**: WebFetch로 확인된 데이터베이스 쿼리 API 명세.

**결론**: PRD 요구사항 그대로 구현 가능.

#### 판정: ✅ 완전 지원

이슈: 없음

---

### F002 — 글 상세 조회 (Blocks API 본문 렌더링)

#### Chain of Thought

**관찰**: PRD는 Notion Blocks API로 페이지 본문을 블록 단위로 가져오고, 지정된 블록 타입을 렌더링하며, 미지원 블록은 플레인 텍스트로 폴백한다.

**추론**:
- `[FACT]` `GET /v1/pages/{page_id}` 엔드포인트는 **속성만 반환**하며, 본문 블록은 반환하지 않는다. 본문을 가져오려면 **반드시 별도로** `GET /v1/blocks/{block_id}/children`을 호출해야 한다.
- `[FACT]` PRD에서 요구하는 모든 블록 타입이 Notion API에서 지원된다:
  - `paragraph` ✓
  - `heading_1`, `heading_2`, `heading_3` ✓
  - `bulleted_list_item` ✓
  - `numbered_list_item` ✓
  - `code` ✓
  - `image` ✓
  - `quote` ✓
  - `divider` ✓
- `[FACT]` 미지원 블록은 `unsupported` 타입으로 반환되므로, 이 타입을 감지하여 플레인 텍스트로 폴백하는 로직이 필요하다.
- `[FACT]` 중첩 블록(예: 리스트 안의 리스트)은 `has_children: true`인 블록에 대해 **재귀 호출**이 필요하다. 이는 추가 구현 복잡도를 유발한다.
- `[FACT]` 블록도 `page_size` 기반 페이지네이션이 적용된다. 본문이 긴 경우 여러 번 API를 호출하여 전체 블록을 수집해야 한다.

**근거**: WebFetch로 확인된 Blocks API 명세 및 Retrieve a Page API 명세.

**결론**: 구현 가능하나, 페이지 조회와 블록 조회 **2단계 API 호출**이 필수이며, 중첩 블록 재귀 처리와 페이지네이션 처리가 필요하다.

#### 판정: ⚠️ 조건부 지원

이슈: **Major** — PRD에 "Blocks API로 페이지 본문 블록 단위 가져오기"라고 명시되어 있으나, 페이지 조회 API와 블록 조회 API가 분리되어 있음을 명확히 인식해야 한다. 중첩 블록 재귀 처리 구현 복잡도 존재.

---

### F003 — 카테고리별 필터링

#### Chain of Thought

**관찰**: PRD는 Notion `Category` select 타입 필드를 기반으로 필터링하며, 전체 카테고리 목록은 DB 조회 시 동적으로 수집한다.

**추론**:
- `[INFERENCE]` `select` 타입 필드에 대한 필터(`equals`)는 F001과 동일한 방식으로 지원된다.
- `[UNCERTAIN]` 전체 카테고리 목록을 "동적 수집"하는 방법은 두 가지다:
  1. 데이터베이스 스키마(속성 정보)를 `GET /v1/databases/{database_id}`로 조회하면 `select` 타입 속성의 옵션 목록을 가져올 수 있다.
  2. 모든 게시글을 쿼리하여 클라이언트 측에서 `category` 값을 중복 없이 수집한다.
- `[INFERENCE]` 방법 1이 더 효율적이며, DB 스키마 조회 API에서 select 옵션 목록이 반환된다.
- `[INFERENCE]` 특정 카테고리 필터링은 DB 쿼리 시 `filter` 파라미터에 `select.equals` 조건을 추가하면 된다.

**근거**: Notion API의 데이터베이스 구조 및 select 필터 패턴.

**결론**: 완전히 구현 가능하며, 카테고리 목록 수집도 DB 스키마 조회 API로 해결 가능하다.

#### 판정: ✅ 완전 지원

이슈: 없음

---

### F004 — 검색 기능 (제목 기반, 클라이언트 사이드)

#### Chain of Thought

**관찰**: PRD는 Title 필드 기준 문자열 포함 검색을 클라이언트 사이드에서 debounce 300ms로 구현한다.

**추론**:
- `[FACT]` Notion `/search` API는 제목(title)에 쿼리 문자열이 포함된 항목만 반환한다. 즉, 서버 측 제목 검색도 가능하다.
- `[FACT]` PRD는 클라이언트 사이드 검색을 명시하고 있다. 이 경우 미리 로드된 글 목록 배열을 클라이언트에서 필터링하는 방식이다.
- `[INFERENCE]` 클라이언트 사이드 검색은 Notion API와 무관하게 JavaScript `String.includes()` 또는 `toLowerCase()` 비교로 구현 가능하다.
- `[INFERENCE]` debounce 300ms는 React의 `useEffect` + `setTimeout` 또는 `lodash.debounce`로 구현 가능하다.
- `[FACT]` 단, 클라이언트 사이드 검색은 **이미 로드된 데이터**만 검색한다. 페이지네이션이 적용된 경우 현재 페이지 데이터만 검색 대상이 된다.

**근거**: WebFetch로 확인된 검색 API 명세 및 일반 프론트엔드 구현 패턴.

**결론**: 클라이언트 사이드 제목 검색은 Notion API와 무관하게 구현 가능하다. 단, 페이지네이션 적용 시 검색 범위 제한이 발생한다.

#### 판정: ⚠️ 조건부 지원

이슈: **Minor** — 페이지네이션과 클라이언트 사이드 검색의 조합 시, 현재 로드되지 않은 페이지의 글은 검색 결과에 포함되지 않는다. MVP 단계에서 게시글 수가 적다면 문제없으나, 규모가 커지면 서버 사이드 검색으로 전환이 필요하다.

---

### F005 — 반응형 디자인

#### Chain of Thought

**관찰**: PRD는 반응형 디자인을 MVP 필수 기능으로 요구한다.

**추론**:
- `[INFERENCE]` 반응형 디자인은 Notion API와 완전히 무관하며, CSS/프레임워크 수준의 구현 사항이다.
- `[INFERENCE]` 프로젝트는 Tailwind CSS v4를 사용하고 있으므로, 반응형 브레이크포인트(`sm:`, `md:`, `lg:` 등)를 활용하여 구현 가능하다.
- `[INFERENCE]` shadcn/ui 컴포넌트가 이미 설치되어 있으며, 이 컴포넌트들은 기본적으로 반응형을 지원한다.

**근거**: 프로젝트 기술 스택 (Tailwind CSS v4, shadcn/ui).

**결론**: Notion API와 무관하게 완전히 구현 가능하다.

#### 판정: ✅ 완전 지원

이슈: 없음

---

### F006 — 다크모드 지원

#### Chain of Thought

**관찰**: PRD는 다크모드 지원을 MVP 필수 기능으로 요구한다.

**추론**:
- `[INFERENCE]` 다크모드는 Notion API와 완전히 무관하며, 프론트엔드 구현 사항이다.
- `[INFERENCE]` 프로젝트에 이미 `next-themes`가 설치되어 있고 `ThemeProvider`가 구성되어 있으므로, 별도 설정 없이 즉시 활용 가능하다.
- `[INFERENCE]` Tailwind CSS v4의 `.dark` 클래스 전환 방식 (`@custom-variant dark`) 이 이미 `globals.css`에 적용되어 있다.

**근거**: 프로젝트 CLAUDE.md의 기술 스택 및 컴포넌트 구성.

**결론**: 이미 기반 인프라가 구축되어 있어 추가 작업 없이 구현 가능하다.

#### 판정: ✅ 완전 지원

이슈: 없음

---

### F007 — ISR (증분 정적 재생성) 캐싱, 60초 주기

#### Chain of Thought

**관찰**: PRD는 `export const revalidate = 60`을 사용하여 60초 주기 ISR 캐싱을 요구한다.

**추론**:
- `[INFERENCE]` Next.js App Router에서 `export const revalidate = 60`은 해당 페이지/라우트 세그먼트를 60초마다 재검증하도록 설정하는 표준 방법이다.
- `[FACT]` Notion API Rate Limit은 **초당 평균 3개 요청**이다. ISR이 60초마다 실행되고, 한 번 실행 시 수 개의 API 호출(글 목록, 블록 조회 등)이 발생한다면 Rate Limit과의 충돌 가능성은 낮다.
- `[INFERENCE]` 단, 동시에 여러 페이지가 revalidate되는 경우(예: 블로그 글이 50개이고 각 상세 페이지가 동시에 재생성되는 경우) Rate Limit 초과 가능성이 있다.
- `[INFERENCE]` Next.js의 `fetch` 캐싱 + `revalidate` 옵션과 Notion API 호출을 조합하면 실제 API 호출 횟수를 최소화할 수 있다.
- `[FACT]` Rate Limit 초과 시 HTTP 429와 `Retry-After` 헤더가 반환되므로, 재시도 로직을 구현해야 한다.

**근거**: WebFetch로 확인된 Rate Limit 정책 및 Next.js ISR 동작 방식.

**결론**: ISR 자체는 Next.js 표준 기능으로 완전히 지원된다. Rate Limit과의 관계는 게시글 수가 많아지면 주의가 필요하다.

#### 판정: ⚠️ 조건부 지원

이슈: **Minor** — 게시글 수 증가 시 동시 ISR 재생성으로 인한 Rate Limit 초과 가능성. `stale-while-revalidate` 패턴과 Notion API 재시도 로직 구현 권장.

---

### F008 — SEO 메타데이터 (og:image에 커버 이미지 사용)

#### Chain of Thought

**관찰**: PRD는 `og:image`에 Notion 페이지의 커버 이미지를 사용하도록 요구한다.

**추론**:
- `[FACT]` `GET /v1/pages/{page_id}` 응답에는 `cover` 필드가 포함되며, 커버 이미지 URL을 가져올 수 있다.
- `[FACT]` **Notion 내부 이미지 URL(S3 기반)은 만료(expire)된다.** 응답 객체에 `expiry_time` 필드가 존재한다.
- `[INFERENCE]` ISR 캐싱 주기(60초)로 빌드된 페이지에 포함된 `og:image` URL이 만료되면, SNS 공유 시 이미지가 표시되지 않는 문제가 발생한다.
- `[INFERENCE]` 만료 시간은 일반적으로 1시간(3600초)이지만, Notion 정책에 따라 변경될 수 있다.
- `[INFERENCE]` 해결 방법:
  1. Notion 커버 이미지를 별도 스토리지(S3, Cloudflare R2 등)에 복사하여 영구 URL 사용
  2. `og:image`를 동적 라우트(`/api/og`)로 처리하여 항상 최신 URL을 재생성
  3. Next.js `ImageResponse` API를 활용한 동적 OG 이미지 생성
- `[INFERENCE]` Notion 외부 이미지(사용자가 외부 URL로 설정한 커버)는 만료되지 않으므로, 외부 이미지 사용을 권장하는 가이드라인이 필요하다.

**근거**: WebFetch로 확인된 Retrieve a Page API의 이미지 URL 만료 명세.

**결론**: 커버 이미지 자체를 가져오는 것은 가능하나, Notion 내부 이미지 URL 만료로 인해 `og:image`가 깨질 수 있다. 설계 수정이 필요하다.

#### 판정: ⛔ 부분 제한

이슈: **Major** — Notion 내부 이미지 URL은 만료되므로, 정적 빌드/ISR 환경에서 `og:image`로 직접 사용하면 URL 만료 후 이미지가 표시되지 않는다.

---

## 4. 이슈 요약

### Critical 이슈

없음. MVP 구현 자체를 막는 치명적 이슈는 발견되지 않았다.

---

### Major 이슈

| 번호 | 관련 기능 | 이슈 | 설명 |
|------|-----------|------|------|
| M-01 | F002 | 2단계 API 호출 필수 | 페이지 본문은 Retrieve Page API가 아닌 별도 Blocks API로 조회해야 함 |
| M-02 | F002 | 중첩 블록 재귀 처리 | `has_children: true` 블록은 재귀 호출 필요, 구현 복잡도 증가 |
| M-03 | F008 | Notion 이미지 URL 만료 | 내부 이미지 URL에 `expiry_time` 존재, ISR 환경에서 og:image 깨짐 발생 가능 |

---

### Minor 이슈

| 번호 | 관련 기능 | 이슈 | 설명 |
|------|-----------|------|------|
| m-01 | F004 | 클라이언트 검색 범위 제한 | 페이지네이션 적용 시 현재 로드된 데이터만 검색 가능 |
| m-02 | F007 | ISR + Rate Limit 충돌 가능성 | 게시글 수 증가 시 동시 재생성으로 초당 3개 제한 초과 가능 |
| m-03 | F001/F003 | 페이지네이션 처리 | `has_more: true` 시 `next_cursor`를 이용한 추가 조회 구현 필요 |
| m-04 | 전반 | 슬러그 가독성 | `slug` 커스텀 필드 미설정 시 페이지 UUID를 URL로 사용해야 함 |

---

## 5. 수정 권고사항

### M-01 / M-02: 2단계 API 호출 및 중첩 블록 처리

PRD의 F002 구현 시, 다음과 같이 페이지 속성 조회와 블록 조회를 명확히 분리해야 한다.

```typescript
// lib/notion.ts

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * 페이지 속성(메타데이터)을 조회합니다.
 * @param pageId - Notion 페이지 ID
 * @returns 페이지 속성 객체
 */
export async function getPageProperties(pageId: string) {
  return await notion.pages.retrieve({ page_id: pageId });
}

/**
 * 페이지 본문 블록을 재귀적으로 조회합니다.
 * @param blockId - 조회할 블록 ID (최초 호출 시 pageId와 동일)
 * @returns 중첩 블록을 포함한 블록 배열
 */
export async function getBlocksRecursively(blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;

  // 페이지네이션 처리: has_more가 true인 동안 반복 조회
  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      blocks.push(block);
      // 자식 블록이 있는 경우 재귀 조회
      if ("has_children" in block && block.has_children) {
        const children = await getBlocksRecursively(block.id);
        blocks.push(...children);
      }
    }

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}
```

---

### M-03: Notion 이미지 URL 만료 — og:image 처리

Notion 내부 이미지 URL은 만료되므로, `og:image`를 직접 사용하지 말고 다음 중 하나를 선택해야 한다.

**권장안 1: Next.js 동적 OG 이미지 생성 (`/api/og` 라우트)**

```typescript
// app/api/og/route.tsx

import { ImageResponse } from "next/og";
import { getPageProperties } from "@/lib/notion";

export const runtime = "edge";

/**
 * 동적 OG 이미지를 생성합니다.
 * @param request - slug 쿼리 파라미터를 포함한 요청 객체
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return new Response("pageId is required", { status: 400 });
  }

  // 매 요청마다 최신 Notion 데이터를 조회하므로 URL 만료 문제 없음
  const page = await getPageProperties(pageId);

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* page.properties에서 title 추출하여 표시 */}
        OG Image
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

```typescript
// app/(dashboard)/blog/[slug]/page.tsx 에서 메타데이터 생성 예시

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    openGraph: {
      images: [
        {
          // 직접 Notion URL 대신 동적 OG 라우트 사용
          url: `/api/og?pageId=${params.slug}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
```

**권장안 2: 외부 커버 이미지 URL 사용 정책**

Notion 데이터베이스의 커버 이미지를 Notion 내부 업로드 대신 **외부 URL**(예: GitHub raw, Cloudinary, Unsplash 등)로 설정하도록 운영 정책을 수립한다. 외부 URL은 만료되지 않는다.

```typescript
// lib/notion.ts — 이미지 타입 분기 처리

/**
 * Notion 커버 이미지 URL을 추출합니다.
 * 내부 파일(만료됨)과 외부 URL을 구분하여 처리합니다.
 * @param cover - Notion 페이지 cover 객체
 * @returns 이미지 URL 또는 null
 */
export function getCoverImageUrl(cover: any): string | null {
  if (!cover) return null;

  if (cover.type === "external") {
    // 외부 URL: 만료되지 않으므로 직접 사용 가능
    return cover.external.url;
  }

  if (cover.type === "file") {
    // 내부 파일: expiry_time 존재, og:image 직접 사용 금지
    // 동적 OG 라우트를 통해 처리하거나, 이미지를 별도 스토리지에 복사할 것
    return cover.file.url; // ISR 범위 내에서만 사용
  }

  return null;
}
```

---

### m-01: 클라이언트 검색 범위 제한 대응

MVP 단계에서 게시글 수가 적다면, 전체 글 목록을 한 번에 로드하여 클라이언트에서 검색하는 방식이 적합하다. 규모 확장 시 아래 전략을 고려한다.

```typescript
// 전체 글 목록 로드 (page_size를 100으로 설정하여 최대한 많이 가져오기)
export async function getAllPosts() {
  const allPosts: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      filter: {
        property: "Status",
        select: { equals: "발행됨" },
      },
      sorts: [{ property: "Published", direction: "descending" }],
      page_size: 100, // 최대값으로 설정하여 API 호출 횟수 최소화
      start_cursor: cursor,
    });

    allPosts.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return allPosts;
}
```

---

### m-04: 슬러그 커스텀 필드 추가 권장

Notion 페이지 UUID를 URL로 사용하면 가독성과 SEO가 저하된다. Notion DB에 `Slug` 텍스트 타입 속성을 추가하고, 없는 경우 제목을 kebab-case로 변환하여 폴백으로 사용한다.

```typescript
/**
 * 게시글 슬러그를 생성합니다.
 * Slug 속성이 있으면 우선 사용하고, 없으면 제목을 kebab-case로 변환합니다.
 * @param page - Notion 페이지 객체
 * @returns URL 친화적인 슬러그 문자열
 */
export function generateSlug(page: any): string {
  const customSlug = page.properties?.Slug?.rich_text?.[0]?.plain_text;
  if (customSlug) return customSlug;

  const title = page.properties?.Title?.title?.[0]?.plain_text ?? page.id;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
```

---

### m-02: Rate Limit 대응 — 재시도 로직

```typescript
/**
 * Notion API 호출을 Rate Limit 재시도 로직으로 감싸는 래퍼 함수입니다.
 * @param fn - 실행할 Notion API 호출 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @returns API 호출 결과
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error?.status === 429 && attempt < maxRetries - 1) {
        const retryAfter = parseInt(error?.headers?.["retry-after"] ?? "1", 10);
        // Retry-After 헤더 값만큼 대기 후 재시도
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("최대 재시도 횟수를 초과했습니다.");
}
```

---

## 6. 검증 종합 평가

### 기능별 판정 요약

| 기능 | 판정 | 이슈 등급 | 비고 |
|------|------|-----------|------|
| F001 글 목록 조회 | ✅ 완전 지원 | 없음 | select equals 필터 + 정렬 + 페이지네이션 모두 지원 |
| F002 글 상세 조회 | ⚠️ 조건부 지원 | Major | 2단계 API 호출 필수, 재귀 처리 구현 필요 |
| F003 카테고리 필터링 | ✅ 완전 지원 | 없음 | DB 스키마 조회로 카테고리 목록 동적 수집 가능 |
| F004 검색 기능 | ⚠️ 조건부 지원 | Minor | 클라이언트 측 검색 범위 제한 (현재 로드 데이터) |
| F005 반응형 디자인 | ✅ 완전 지원 | 없음 | Notion API 무관, Tailwind CSS로 구현 |
| F006 다크모드 | ✅ 완전 지원 | 없음 | next-themes 이미 구성됨 |
| F007 ISR 캐싱 | ⚠️ 조건부 지원 | Minor | 게시글 수 증가 시 Rate Limit 주의 필요 |
| F008 SEO og:image | ⛔ 부분 제한 | Major | Notion 내부 이미지 URL 만료 문제, 설계 수정 필요 |

### MVP 진행 가능 여부 판정

**MVP 진행 가능 (조건부 승인)**

Critical 이슈(구현 불가)가 없으며, Major 이슈 2건도 기술적으로 해결 가능하다. 다음 조건을 충족한 상태에서 MVP 개발을 진행한다.

### 최종 권고사항

1. **즉시 조치 (개발 착수 전)**
   - `@notionhq/client` 패키지 설치 (`npm install @notionhq/client`)
   - Notion DB에 `Slug` 텍스트 속성 추가
   - 환경 변수 파일에 `NOTION_API_KEY`, `NOTION_DATABASE_ID` 추가 (`.env.example` 먼저 작성)
   - Notion DB 커버 이미지를 **외부 URL**로 설정하는 정책 수립

2. **F002 구현 시**
   - 페이지 조회 API와 블록 조회 API를 명확히 분리하여 구현
   - 중첩 블록 재귀 처리 및 블록 페이지네이션 처리 포함

3. **F008 구현 시**
   - Notion 내부 이미지 URL을 `og:image`에 직접 사용하지 말 것
   - Next.js 동적 OG 이미지 라우트(`/api/og`) 또는 외부 이미지 URL 정책 중 하나 선택

4. **안정성 확보**
   - 모든 Notion API 호출에 Rate Limit 재시도 로직(`withRetry`) 적용
   - 에러는 반드시 catch 후 로거(winston/pino)로 기록

5. **향후 확장 시**
   - 게시글 수 증가 → 서버 사이드 검색(`/search` API 또는 DB 필터) 전환 검토
   - Notion 이미지 → 별도 스토리지(S3, Cloudflare R2) 마이그레이션 검토

---

*본 검증 보고서는 2026-03-10 기준 Notion API 공식 문서를 기반으로 작성되었습니다.*
*API 명세는 변경될 수 있으므로, 실제 개발 시 최신 문서를 재확인하시기 바랍니다.*
