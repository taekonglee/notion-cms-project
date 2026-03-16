import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CategoryBadge } from "@/components/blog/category-badge";
import { TagBadge } from "@/components/blog/tag-badge";
import { NotionRenderer } from "@/components/blog/notion-renderer";
import {
  fetchPublishedPosts,
  fetchPostBySlug,
  fetchPageBlocks,
} from "@/lib/notion-api";
import type { NotionRichText } from "@/types/blog";

/** ISR: 60초마다 재검증 */
export const revalidate = 60;

/**
 * 빌드 시 발행된 글의 slug 목록으로 정적 경로를 사전 생성
 * @returns slug 파라미터 배열
 */
export async function generateStaticParams() {
  const posts = await fetchPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 글 상세 페이지 동적 SEO 메타데이터 생성
 * - title: 글 제목
 * - description: 첫 번째 paragraph 블록 텍스트 (최대 160자)
 * - og:image: coverImage 외부 URL (PRD M-03 — 내부 URL 사용 금지)
 * @param params - URL 동적 세그먼트 ({ slug: string })
 */
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) return { title: "글을 찾을 수 없습니다" };

  // 첫 번째 paragraph 블록에서 description 추출
  const blocks = await fetchPageBlocks(post.id);
  const firstParagraph = blocks.find((b) => b.type === "paragraph");
  let description = `${post.title} - Dev Blog`;

  if (
    firstParagraph &&
    Array.isArray(firstParagraph.content) &&
    firstParagraph.content.length > 0 &&
    "plainText" in firstParagraph.content[0]
  ) {
    const text = (firstParagraph.content as NotionRichText[])
      .map((r) => r.plainText)
      .join("")
      .slice(0, 160);
    if (text.trim()) description = text;
  }

  return {
    title: `${post.title} | Dev Blog`,
    description,
    openGraph: post.coverImage
      ? { images: [{ url: post.coverImage }] }
      : undefined,
  };
}

/**
 * 블로그 글 상세 페이지 — /blog/[slug]
 * 2단계 API 호출: 메타데이터(fetchPostBySlug) + 본문 블록(fetchPageBlocks)
 * @param params - URL 동적 세그먼트 ({ slug: string })
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // 1단계: slug로 글 메타데이터 조회
  const post = await fetchPostBySlug(slug);
  if (!post) notFound();

  // 2단계: 페이지 ID로 본문 블록 조회 (중첩 블록 재귀 포함)
  const blocks = await fetchPageBlocks(post.id);

  // 발행일 포맷팅 (publishedAt이 없는 경우 폴백 처리)
  const formattedDate = post.publishedAt
    ? format(parseISO(post.publishedAt), "yyyy. MM. dd.", { locale: ko })
    : "";

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* 뒤로가기 버튼 */}
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4 mr-1" />
          블로그 목록
        </Link>
      </Button>

      {/* 글 헤더 */}
      <header className="mb-8">
        <CategoryBadge category={post.category} className="mb-3" />
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <TagBadge tags={post.tags} />
          {formattedDate && (
            <time
              dateTime={post.publishedAt}
              className="text-sm text-muted-foreground"
            >
              {formattedDate}
            </time>
          )}
        </div>
      </header>

      <Separator className="mb-8" />

      {/* 본문 블록 렌더링 */}
      <NotionRenderer blocks={blocks} />
    </article>
  );
}
