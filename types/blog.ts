/**
 * 블로그 관련 TypeScript 타입 정의
 * Notion 데이터베이스 필드와 API 응답을 기반으로 정의
 */

/** Notion 데이터베이스에서 가져온 블로그 글 타입 */
export interface BlogPost {
  /** Notion 페이지 고유 ID */
  id: string;
  /** 글 제목 */
  title: string;
  /** 카테고리 (단일 선택) */
  category: string;
  /** 태그 목록 (복수 선택) */
  tags: string[];
  /** 발행일 (ISO 8601 문자열) */
  publishedAt: string;
  /** 글 상태 */
  status: "초안" | "발행됨";
  /**
   * 슬러그 (URL용)
   * 우선순위: Notion DB Slug 필드 → 제목 kebab-case 변환 → 페이지 ID 폴백
   */
  slug: string;
  /**
   * 커버 이미지 URL (OG 이미지용)
   * 반드시 외부 URL만 사용 (Notion 내부 파일 URL 금지 — PRD M-03)
   */
  coverImage?: string;
}

/** Notion Rich Text 어노테이션 타입 */
export interface NotionAnnotations {
  /** 굵게 */
  bold: boolean;
  /** 기울임 */
  italic: boolean;
  /** 취소선 */
  strikethrough: boolean;
  /** 밑줄 */
  underline: boolean;
  /** 인라인 코드 */
  code: boolean;
}

/** Notion Rich Text 타입 */
export interface NotionRichText {
  /** 순수 텍스트 */
  plainText: string;
  /** 링크 URL (없으면 null) */
  href: string | null;
  /** 텍스트 서식 */
  annotations: NotionAnnotations;
}

/** 코드 블록 타입 */
export interface NotionCodeBlock {
  /** 프로그래밍 언어 (예: javascript, typescript) */
  language: string;
  /** 코드 내용 (Rich Text 배열) */
  richText: NotionRichText[];
}

/**
 * 이미지 블록 타입
 * external: 외부 URL (만료 없음, OG 이미지 사용 가능)
 * file: Notion 내부 파일 (expiry_time 존재 — PRD M-03)
 */
export interface NotionImageBlock {
  /** 이미지 소스 타입 */
  type: "external" | "file";
  /** 이미지 URL */
  url: string;
  /** 이미지 캡션 */
  caption: NotionRichText[];
}

/** 지원하는 Notion 블록 타입 유니온 */
export type NotionBlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list_item"
  | "numbered_list_item"
  | "code"
  | "image"
  | "quote"
  | "divider"
  | "unsupported";

/** Notion Block 렌더링 타입 */
export interface NotionBlock {
  /** 블록 고유 ID */
  id: string;
  /** 블록 타입 */
  type: NotionBlockType;
  /**
   * 블록 타입별 콘텐츠
   * - paragraph/heading/list/quote: NotionRichText[]
   * - code: NotionCodeBlock
   * - image: NotionImageBlock
   * - divider: null
   */
  content: NotionRichText[] | NotionCodeBlock | NotionImageBlock | null;
  /** 중첩 자식 블록 (has_children: true인 경우 재귀 조회) */
  children?: NotionBlock[];
}
