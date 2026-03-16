/**
 * Notion API 데이터 fetch 함수 모음
 * withRetry()로 Rate Limit(HTTP 429) 재시도 처리 포함
 *
 * @notionhq/client v5.x: databases.query() 제거 → dataSources.query() 사용
 */
import type {
  DataSourceObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type {
  BlogPost,
  NotionBlock,
  NotionBlockType,
  NotionCodeBlock,
  NotionImageBlock,
  NotionRichText,
} from "@/types/blog";
import { NOTION_DATABASE_ID, notionClient, withRetry } from "./notion";

// ─── 내부 헬퍼 함수 ──────────────────────────────────────

/**
 * 제목 문자열을 URL 친화적인 kebab-case 슬러그로 변환
 * 영문 기준 변환, 한글만 있는 경우 빈 문자열 반환 (호출부에서 fallback 처리)
 * @param title - 변환할 제목 문자열
 * @returns kebab-case 슬러그 문자열
 */
function toKebabCase(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "") // 영숫자, 한글, 공백, 하이픈만 유지
    .replace(/\s+/g, "-") // 공백 → 하이픈
    .replace(/-+/g, "-") // 연속 하이픈 제거
    .replace(/^-|-$/g, ""); // 앞뒤 하이픈 제거
}

/**
 * Notion API RichText 배열을 NotionRichText 배열로 변환
 * @param richTextArray - Notion API의 raw richtext 배열
 * @returns 앱에서 사용하는 NotionRichText 배열
 */
function mapRichText(
  richTextArray: Array<{
    plain_text: string;
    href: string | null;
    annotations: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
    };
  }>
): NotionRichText[] {
  return richTextArray.map((rt) => ({
    plainText: rt.plain_text,
    href: rt.href,
    annotations: {
      bold: rt.annotations.bold,
      italic: rt.annotations.italic,
      strikethrough: rt.annotations.strikethrough,
      underline: rt.annotations.underline,
      code: rt.annotations.code,
    },
  }));
}

/**
 * Notion API 블록 응답 객체를 NotionBlock 타입으로 변환
 * 미지원 블록 타입은 "unsupported"로 처리하여 플레인 텍스트 폴백
 * @param block - Notion API의 raw 블록 객체
 * @returns 앱에서 사용하는 NotionBlock 객체
 */
function mapBlockToNotionBlock(
  block: Record<string, unknown>
): Omit<NotionBlock, "children"> {
  const id = block.id as string;
  const type = block.type as string;

  const supportedTypes: NotionBlockType[] = [
    "paragraph",
    "heading_1",
    "heading_2",
    "heading_3",
    "bulleted_list_item",
    "numbered_list_item",
    "code",
    "image",
    "quote",
    "divider",
  ];

  const blockType: NotionBlockType = supportedTypes.includes(
    type as NotionBlockType
  )
    ? (type as NotionBlockType)
    : "unsupported";

  // divider는 content 없음
  if (blockType === "divider") {
    return { id, type: blockType, content: null };
  }

  const blockData = block[type] as Record<string, unknown> | undefined;
  if (!blockData) {
    return { id, type: "unsupported", content: null };
  }

  // 코드 블록 처리
  if (blockType === "code") {
    const codeContent: NotionCodeBlock = {
      language: (blockData.language as string) ?? "plain text",
      richText: mapRichText(
        (blockData.rich_text as Parameters<typeof mapRichText>[0]) ?? []
      ),
    };
    return { id, type: blockType, content: codeContent };
  }

  // 이미지 블록 처리
  if (blockType === "image") {
    const imageType = blockData.type as "external" | "file";
    const imageData = blockData[imageType] as { url: string } | undefined;
    const imageContent: NotionImageBlock = {
      type: imageType,
      url: imageData?.url ?? "",
      caption: mapRichText(
        (blockData.caption as Parameters<typeof mapRichText>[0]) ?? []
      ),
    };
    return { id, type: blockType, content: imageContent };
  }

  // unsupported 블록: rich_text가 있으면 플레인 텍스트로 폴백
  if (blockType === "unsupported") {
    const richText = blockData.rich_text as
      | Parameters<typeof mapRichText>[0]
      | undefined;
    if (richText) {
      return { id, type: blockType, content: mapRichText(richText) };
    }
    return { id, type: blockType, content: null };
  }

  // paragraph, heading_1/2/3, bulleted/numbered_list_item, quote
  const richText = blockData.rich_text as
    | Parameters<typeof mapRichText>[0]
    | undefined;
  return {
    id,
    type: blockType,
    content: mapRichText(richText ?? []),
  };
}

// ─── 공개 API 함수 ───────────────────────────────────────

/**
 * Notion 페이지 응답 객체를 BlogPost 타입으로 변환
 * Slug 필드 우선, 없으면 제목 kebab-case, 한글만 있으면 page.id 폴백
 * @param page - Notion API에서 반환된 PageObjectResponse
 * @returns 앱에서 사용할 BlogPost 객체
 */
export function mapPageToBlogPost(page: PageObjectResponse): BlogPost {
  const props = page.properties;

  // 제목 속성 추출 (Notion DB: "제목")
  const titleProp = props["제목"];
  const title =
    titleProp?.type === "title"
      ? titleProp.title.map((t) => t.plain_text).join("")
      : "";

  // 카테고리 속성 추출 (Notion DB: "선택")
  const categoryProp = props["선택"];
  const category =
    categoryProp?.type === "select"
      ? (categoryProp.select?.name ?? "")
      : "";

  // 태그 속성 추출 (Notion DB: "태그")
  const tagsProp = props["태그"];
  const tags =
    tagsProp?.type === "multi_select"
      ? tagsProp.multi_select.map((t) => t.name)
      : [];

  // 발행일 속성 추출 (Notion DB: "발행일")
  const publishedProp = props["발행일"];
  const publishedAt =
    publishedProp?.type === "date"
      ? (publishedProp.date?.start ?? "")
      : "";

  // 상태 속성 추출 (Notion DB: "상태")
  const statusProp = props["상태"];
  const status =
    statusProp?.type === "select"
      ? ((statusProp.select?.name ?? "초안") as "초안" | "발행됨")
      : "초안";

  // Slug 속성 추출 (rich_text 필드 우선)
  const slugProp = props["Slug"];
  const slugFromField =
    slugProp?.type === "rich_text"
      ? slugProp.rich_text.map((t) => t.plain_text).join("").trim()
      : "";

  // Slug 결정: Slug 필드 → title kebab-case → page.id 폴백
  const kebabTitle = toKebabCase(title);
  const slug = slugFromField || kebabTitle || page.id;

  // 커버 이미지 추출 (외부 URL만 사용, 내부 파일 URL 금지 — PRD M-03)
  let coverImage: string | undefined;
  if (page.cover?.type === "external") {
    coverImage = page.cover.external.url;
  }
  // cover.type === "file"인 경우 Notion 내부 URL은 사용하지 않음

  return {
    id: page.id,
    title,
    category,
    tags,
    publishedAt,
    status,
    slug,
    coverImage,
  };
}

interface FetchPublishedPostsOptions {
  /** 가져올 최대 글 수 (미지정 시 전체) */
  limit?: number;
  /** 검색에 사용할 page_size (기본값: 100) */
  pageSize?: number;
}

/**
 * Notion 데이터베이스에서 발행된 글 목록을 가져옴
 * Status=발행됨 필터, Published 내림차순 정렬
 * has_more/next_cursor 루프로 전체 페이지네이션 처리 (PRD m-03)
 *
 * @param options - 페이지네이션 옵션
 * @returns BlogPost 배열
 */
export async function fetchPublishedPosts(
  options: FetchPublishedPostsOptions = {}
): Promise<BlogPost[]> {
  const { limit, pageSize = 100 } = options;
  const posts: BlogPost[] = [];
  let cursor: string | undefined;

  do {
    const response = await withRetry(() =>
      notionClient.dataSources.query({
        data_source_id: NOTION_DATABASE_ID,
        filter: {
          property: "상태",
          select: { equals: "발행됨" },
        },
        sorts: [{ property: "발행일", direction: "descending" }],
        page_size: pageSize,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );

    for (const page of response.results) {
      if (page.object !== "page") continue;
      posts.push(mapPageToBlogPost(page as PageObjectResponse));

      // limit이 지정된 경우 도달하면 즉시 반환
      if (limit && posts.length >= limit) {
        return posts.slice(0, limit);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return posts;
}

/**
 * 특정 페이지의 메타데이터(속성)만 조회 — 1단계 API 호출 (PRD M-01)
 * 본문 블록은 포함되지 않으며, fetchPageBlocks()로 별도 조회 필요
 *
 * @param pageId - Notion 페이지 ID
 * @returns BlogPost 메타데이터 또는 null (페이지 미존재 시)
 */
export async function fetchPageMetadata(
  pageId: string
): Promise<BlogPost | null> {
  try {
    const page = await withRetry(() =>
      notionClient.pages.retrieve({ page_id: pageId })
    );

    if (page.object !== "page") return null;
    return mapPageToBlogPost(page as PageObjectResponse);
  } catch {
    return null;
  }
}

/**
 * 특정 페이지의 본문 블록을 모두 조회 — 2단계 API 호출 (PRD M-01, M-02)
 * has_more/next_cursor 루프 + has_children 중첩 블록 재귀 처리
 *
 * @param blockId - 조회할 블록 ID (페이지 ID와 동일)
 * @returns NotionBlock 배열 (중첩 블록 포함)
 */
export async function fetchPageBlocks(blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response = await withRetry(() =>
      notionClient.blocks.children.list({
        block_id: blockId,
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      })
    );

    for (const rawBlock of response.results) {
      if (rawBlock.object !== "block") continue;

      const block = mapBlockToNotionBlock(
        rawBlock as Record<string, unknown>
      ) as NotionBlock;

      // 중첩 블록 재귀 처리 (PRD M-02)
      const hasChildren = (rawBlock as Record<string, unknown>).has_children as
        | boolean
        | undefined;
      if (hasChildren) {
        block.children = await fetchPageBlocks(rawBlock.id);
      }

      blocks.push(block);
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

/**
 * Notion 데이터베이스 스키마에서 Category select 옵션 목록을 조회
 *
 * @returns 카테고리 이름 문자열 배열
 */
export async function fetchCategories(): Promise<string[]> {
  const dataSource = await withRetry(() =>
    notionClient.dataSources.retrieve({
      data_source_id: NOTION_DATABASE_ID,
    })
  );

  const response = dataSource as DataSourceObjectResponse;
  // Notion DB 카테고리 속성명: "선택"
  const categoryProp = response.properties?.["선택"];
  if (!categoryProp || categoryProp.type !== "select") return [];

  return categoryProp.select.options.map((option) => option.name);
}

/**
 * slug 문자열로 블로그 글을 조회
 * 발행된 글 전체를 조회한 후 slug가 일치하는 글을 찾음
 *
 * @param slug - 검색할 슬러그 문자열
 * @returns BlogPost 또는 null (미존재 시)
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}
