/**
 * Notion 블록 렌더러 컴포넌트
 * NotionBlock 배열을 받아 React JSX로 렌더링한다.
 *
 * 지원 블록 타입:
 * paragraph, heading_1/2/3, bulleted_list_item, numbered_list_item,
 * code, image, quote, divider, unsupported(폴백)
 */
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type {
  NotionBlock,
  NotionCodeBlock,
  NotionImageBlock,
  NotionRichText,
} from "@/types/blog";

// ─── 내부 타입 ────────────────────────────────────────

/** 리스트 블록 그룹핑 결과 타입 */
type GroupedBlock =
  | { type: "bulleted_group"; items: NotionBlock[] }
  | { type: "numbered_group"; items: NotionBlock[] }
  | { type: "single"; block: NotionBlock };

// ─── 헬퍼 함수 ────────────────────────────────────────

/**
 * NotionRichText 배열을 인라인 JSX 요소로 변환
 * bold, italic, code, strikethrough, underline 어노테이션과 href 링크 처리
 * @param richTexts - 렌더링할 NotionRichText 배열
 * @returns 인라인 JSX 요소 배열
 */
function renderRichText(richTexts: NotionRichText[]): React.ReactNode {
  return richTexts.map((rt, index) => {
    let node: React.ReactNode = rt.plainText;

    if (rt.annotations.code) {
      node = (
        <code
          key={`code-${index}`}
          className="bg-muted px-1 rounded text-sm font-mono"
        >
          {node}
        </code>
      );
    }
    if (rt.annotations.bold) {
      node = <strong key={`bold-${index}`}>{node}</strong>;
    }
    if (rt.annotations.italic) {
      node = <em key={`italic-${index}`}>{node}</em>;
    }
    if (rt.annotations.strikethrough) {
      node = <s key={`s-${index}`}>{node}</s>;
    }
    if (rt.annotations.underline) {
      node = <u key={`u-${index}`}>{node}</u>;
    }
    if (rt.href) {
      node = (
        <a
          key={`a-${index}`}
          href={rt.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-primary transition-colors"
        >
          {node}
        </a>
      );
    }

    return <span key={index}>{node}</span>;
  });
}

/**
 * 연속된 리스트 블록을 그룹으로 묶는 함수
 * bulleted_list_item → bulleted_group, numbered_list_item → numbered_group
 * @param blocks - 그룹핑할 NotionBlock 배열
 * @returns GroupedBlock 배열
 */
function groupBlocks(blocks: NotionBlock[]): GroupedBlock[] {
  const result: GroupedBlock[] = [];

  for (const block of blocks) {
    const lastGroup = result[result.length - 1];

    if (block.type === "bulleted_list_item") {
      if (lastGroup?.type === "bulleted_group") {
        lastGroup.items.push(block);
      } else {
        result.push({ type: "bulleted_group", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      if (lastGroup?.type === "numbered_group") {
        lastGroup.items.push(block);
      } else {
        result.push({ type: "numbered_group", items: [block] });
      }
    } else {
      result.push({ type: "single", block });
    }
  }

  return result;
}

/**
 * 개별 NotionBlock을 JSX로 렌더링
 * @param block - 렌더링할 NotionBlock
 * @returns JSX 요소 또는 null
 */
function renderBlock(block: NotionBlock): React.ReactNode {
  const { id, type, content, children } = block;

  switch (type) {
    case "paragraph": {
      const richText = content as NotionRichText[];
      return (
        <p key={id} className="my-3 leading-7">
          {renderRichText(richText ?? [])}
          {children && children.length > 0 && (
            <NotionRenderer blocks={children} />
          )}
        </p>
      );
    }

    case "heading_1": {
      const richText = content as NotionRichText[];
      return (
        <h1 key={id} className="text-3xl font-bold mt-8 mb-4">
          {renderRichText(richText ?? [])}
        </h1>
      );
    }

    case "heading_2": {
      const richText = content as NotionRichText[];
      return (
        <h2 key={id} className="text-2xl font-semibold mt-6 mb-3">
          {renderRichText(richText ?? [])}
        </h2>
      );
    }

    case "heading_3": {
      const richText = content as NotionRichText[];
      return (
        <h3 key={id} className="text-xl font-semibold mt-5 mb-2">
          {renderRichText(richText ?? [])}
        </h3>
      );
    }

    case "code": {
      const codeBlock = content as NotionCodeBlock;
      const codeText = codeBlock?.richText.map((rt) => rt.plainText).join("") ?? "";
      const language = codeBlock?.language ?? "plain text";
      return (
        <div key={id} className="my-4">
          <div className="flex items-center justify-between bg-muted/70 px-4 py-1.5 rounded-t-md border border-b-0 border-border">
            <span className="text-xs text-muted-foreground font-mono">
              {language}
            </span>
          </div>
          <ScrollArea className="rounded-b-md border border-border">
            <pre className="bg-muted p-4 overflow-x-auto">
              <code className="block text-sm font-mono whitespace-pre">
                {codeText}
              </code>
            </pre>
          </ScrollArea>
        </div>
      );
    }

    case "image": {
      const imageBlock = content as NotionImageBlock;
      const captionText =
        imageBlock?.caption.map((rt) => rt.plainText).join("") ?? "";
      const url = imageBlock?.url ?? "";

      if (imageBlock?.type === "external") {
        return (
          <figure key={id} className="my-6">
            <div className="relative w-full h-80 rounded-lg overflow-hidden">
              <Image
                src={url}
                alt={captionText || "블로그 이미지"}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            {captionText && (
              <figcaption className="text-center text-sm text-muted-foreground mt-2">
                {captionText}
              </figcaption>
            )}
          </figure>
        );
      }

      // file 타입: Notion 내부 URL은 만료되므로 일반 img 폴백 (PRD M-03)
      return (
        <figure key={id} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={captionText || "블로그 이미지"}
            className="max-w-full rounded-lg mx-auto"
          />
          {captionText && (
            <figcaption className="text-center text-sm text-muted-foreground mt-2">
              {captionText}
            </figcaption>
          )}
        </figure>
      );
    }

    case "quote": {
      const richText = content as NotionRichText[];
      return (
        <blockquote
          key={id}
          className="border-l-4 border-muted-foreground/30 pl-4 italic my-4 text-muted-foreground"
        >
          {renderRichText(richText ?? [])}
          {children && children.length > 0 && (
            <NotionRenderer blocks={children} />
          )}
        </blockquote>
      );
    }

    case "divider": {
      return <Separator key={id} className="my-6" />;
    }

    case "unsupported": {
      if (!content) return null;
      const richText = content as NotionRichText[];
      if (!Array.isArray(richText) || richText.length === 0) return null;
      return (
        <p key={id} className="my-3 leading-7 text-muted-foreground">
          {renderRichText(richText)}
        </p>
      );
    }

    // bulleted_list_item / numbered_list_item은 groupBlocks에서 처리
    default:
      return null;
  }
}

/**
 * 리스트 아이템 블록(bulleted/numbered)을 <li>로 렌더링
 * children이 있으면 재귀 렌더링
 * @param block - bulleted_list_item 또는 numbered_list_item 블록
 * @returns <li> JSX 요소
 */
function renderListItem(block: NotionBlock): React.ReactNode {
  const richText = block.content as NotionRichText[];
  return (
    <li key={block.id} className="my-1 leading-7">
      {renderRichText(richText ?? [])}
      {block.children && block.children.length > 0 && (
        <NotionRenderer blocks={block.children} />
      )}
    </li>
  );
}

// ─── 공개 컴포넌트 ────────────────────────────────────

interface NotionRendererProps {
  /** 렌더링할 NotionBlock 배열 */
  blocks: NotionBlock[];
}

/**
 * Notion 블록 배열을 React JSX로 렌더링하는 컴포넌트
 * Server Component로 동작 (use client 불필요)
 * @param blocks - 렌더링할 NotionBlock 배열
 */
export function NotionRenderer({ blocks }: NotionRendererProps) {
  const grouped = groupBlocks(blocks);

  return (
    <div className="notion-content">
      {grouped.map((group, index) => {
        if (group.type === "bulleted_group") {
          return (
            <ul
              key={`ul-${index}`}
              className="list-disc list-outside ml-6 my-3 space-y-1"
            >
              {group.items.map(renderListItem)}
            </ul>
          );
        }

        if (group.type === "numbered_group") {
          return (
            <ol
              key={`ol-${index}`}
              className="list-decimal list-outside ml-6 my-3 space-y-1"
            >
              {group.items.map(renderListItem)}
            </ol>
          );
        }

        // single block
        return renderBlock(group.block);
      })}
    </div>
  );
}
